#!/usr/bin/env python3
"""Trusted structural analyzer for the Practical Python Supply Tracker.

The learner program is never executed here. This process reads the exact bytes
that the Python supervisor will execute and returns a small, closed boolean
envelope for one server-owned assessment profile.
"""

from __future__ import annotations

import ast
import codecs
import io
import json
import sys
import tokenize
from pathlib import Path
from typing import Callable


PROFILE = "python-data-tools-supply-tracker-v1"
MAX_SOURCE_BYTES = 20_000
MAX_AST_NODES = 512
MAX_AST_DEPTH = 64

_FACT_NAMES = (
    "authored_frame",
    "normalize_name",
    "add_stock",
    "total_stock",
    "low_stock",
    "harness",
)


def _empty_result(*, analyzed: bool, parsed: bool) -> dict[str, object]:
    return {
        "version": 1,
        "profile": PROFILE,
        "analyzed": analyzed,
        "parsed": parsed,
        **{name: False for name in _FACT_NAMES},
    }


def _is_name(node: ast.AST, identifier: str, context: type[ast.expr_context] = ast.Load) -> bool:
    return isinstance(node, ast.Name) and node.id == identifier and isinstance(node.ctx, context)


def _is_integer(node: ast.AST, value: int) -> bool:
    return isinstance(node, ast.Constant) and type(node.value) is int and node.value == value


def _is_string(node: ast.AST, value: str) -> bool:
    return isinstance(node, ast.Constant) and type(node.value) is str and node.value == value


def _is_call(
    node: ast.AST,
    function: str,
    arguments: tuple[Callable[[ast.AST], bool], ...],
) -> bool:
    return (
        isinstance(node, ast.Call)
        and _is_name(node.func, function)
        and len(node.args) == len(arguments)
        and not node.keywords
        and all(check(argument) for check, argument in zip(arguments, node.args))
    )


def _is_method_call(
    node: ast.AST,
    receiver: Callable[[ast.AST], bool],
    method: str,
    arguments: tuple[Callable[[ast.AST], bool], ...] = (),
) -> bool:
    return (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == method
        and isinstance(node.func.ctx, ast.Load)
        and receiver(node.func.value)
        and len(node.args) == len(arguments)
        and not node.keywords
        and all(check(argument) for check, argument in zip(arguments, node.args))
    )


def _has_exact_arguments(function: ast.FunctionDef, names: tuple[str, ...]) -> bool:
    arguments = function.args
    return (
        not arguments.posonlyargs
        and [argument.arg for argument in arguments.args] == list(names)
        and all(argument.annotation is None for argument in arguments.args)
        and arguments.vararg is None
        and not arguments.kwonlyargs
        and not arguments.kw_defaults
        and arguments.kwarg is None
        and not arguments.defaults
        and not function.decorator_list
        and function.returns is None
        and function.type_comment is None
    )


def _single_function(module: ast.Module, name: str) -> ast.FunctionDef | None:
    matches = [
        statement
        for statement in module.body
        if isinstance(statement, ast.FunctionDef) and statement.name == name
    ]
    return matches[0] if len(matches) == 1 else None


def _normalize_name_valid(module: ast.Module) -> bool:
    function = _single_function(module, "normalize_name")
    if function is None or not _has_exact_arguments(function, ("name",)) or len(function.body) != 1:
        return False
    statement = function.body[0]
    return isinstance(statement, ast.Return) and _is_method_call(
        statement.value,
        lambda value: _is_method_call(value, lambda receiver: _is_name(receiver, "name"), "strip"),
        "lower",
    )


def _add_stock_valid(module: ast.Module) -> bool:
    function = _single_function(module, "add_stock")
    if function is None or not _has_exact_arguments(function, ("inventory", "name", "amount")):
        return False
    if len(function.body) != 4:
        return False
    clean_name, current, update, returned = function.body
    clean_name_valid = (
        isinstance(clean_name, ast.Assign)
        and len(clean_name.targets) == 1
        and _is_name(clean_name.targets[0], "clean_name", ast.Store)
        and clean_name.type_comment is None
        and _is_call(
            clean_name.value,
            "normalize_name",
            (lambda value: _is_name(value, "name"),),
        )
    )
    current_valid = (
        isinstance(current, ast.Assign)
        and len(current.targets) == 1
        and _is_name(current.targets[0], "current", ast.Store)
        and current.type_comment is None
        and _is_method_call(
            current.value,
            lambda value: _is_name(value, "inventory"),
            "get",
            (lambda value: _is_name(value, "clean_name"), lambda value: _is_integer(value, 0)),
        )
    )
    update_valid = (
        isinstance(update, ast.Assign)
        and len(update.targets) == 1
        and isinstance(update.targets[0], ast.Subscript)
        and _is_name(update.targets[0].value, "inventory")
        and _is_name(update.targets[0].slice, "clean_name")
        and isinstance(update.targets[0].ctx, ast.Store)
        and update.type_comment is None
        and isinstance(update.value, ast.BinOp)
        and isinstance(update.value.op, ast.Add)
        and _is_name(update.value.left, "current")
        and _is_name(update.value.right, "amount")
    )
    returned_valid = (
        isinstance(returned, ast.Return)
        and isinstance(returned.value, ast.Subscript)
        and _is_name(returned.value.value, "inventory")
        and _is_name(returned.value.slice, "clean_name")
        and isinstance(returned.value.ctx, ast.Load)
    )
    return clean_name_valid and current_valid and update_valid and returned_valid


def _total_stock_valid(module: ast.Module) -> bool:
    function = _single_function(module, "total_stock")
    if function is None or not _has_exact_arguments(function, ("inventory",)):
        return False
    if len(function.body) != 3:
        return False
    initialized, loop, returned = function.body
    initialized_valid = (
        isinstance(initialized, ast.Assign)
        and len(initialized.targets) == 1
        and _is_name(initialized.targets[0], "total", ast.Store)
        and initialized.type_comment is None
        and _is_integer(initialized.value, 0)
    )
    loop_valid = (
        isinstance(loop, ast.For)
        and _is_name(loop.target, "amount", ast.Store)
        and _is_method_call(loop.iter, lambda value: _is_name(value, "inventory"), "values")
        and len(loop.body) == 1
        and isinstance(loop.body[0], ast.AugAssign)
        and _is_name(loop.body[0].target, "total", ast.Store)
        and isinstance(loop.body[0].op, ast.Add)
        and _is_name(loop.body[0].value, "amount")
        and not loop.orelse
        and loop.type_comment is None
    )
    returned_valid = isinstance(returned, ast.Return) and _is_name(returned.value, "total")
    return initialized_valid and loop_valid and returned_valid


def _low_stock_valid(module: ast.Module) -> bool:
    function = _single_function(module, "low_stock")
    if function is None or not _has_exact_arguments(function, ("inventory", "limit")):
        return False
    if len(function.body) != 3:
        return False
    initialized, loop, returned = function.body
    initialized_valid = (
        isinstance(initialized, ast.Assign)
        and len(initialized.targets) == 1
        and _is_name(initialized.targets[0], "names", ast.Store)
        and initialized.type_comment is None
        and isinstance(initialized.value, ast.List)
        and not initialized.value.elts
        and isinstance(initialized.value.ctx, ast.Load)
    )
    conditional = loop.body[0] if isinstance(loop, ast.For) and len(loop.body) == 1 else None
    comparison = conditional.test if isinstance(conditional, ast.If) else None
    append_statement = conditional.body[0] if isinstance(conditional, ast.If) and len(conditional.body) == 1 else None
    loop_valid = (
        isinstance(loop, ast.For)
        and _is_name(loop.target, "name", ast.Store)
        and _is_name(loop.iter, "inventory")
        and not loop.orelse
        and loop.type_comment is None
        and isinstance(conditional, ast.If)
        and not conditional.orelse
        and isinstance(comparison, ast.Compare)
        and isinstance(comparison.left, ast.Subscript)
        and _is_name(comparison.left.value, "inventory")
        and _is_name(comparison.left.slice, "name")
        and isinstance(comparison.left.ctx, ast.Load)
        and len(comparison.ops) == 1
        and isinstance(comparison.ops[0], ast.Lt)
        and len(comparison.comparators) == 1
        and _is_name(comparison.comparators[0], "limit")
        and isinstance(append_statement, ast.Expr)
        and _is_method_call(
            append_statement.value,
            lambda value: _is_name(value, "names"),
            "append",
            (lambda value: _is_name(value, "name"),),
        )
    )
    returned_valid = isinstance(returned, ast.Return) and _is_name(returned.value, "names")
    return initialized_valid and loop_valid and returned_valid


def _stock_call(statement: ast.AST, item_name: str, amount: int) -> bool:
    return (
        isinstance(statement, ast.Expr)
        and _is_call(
            statement.value,
            "add_stock",
            (
                lambda value: _is_name(value, "inventory"),
                lambda value: _is_string(value, item_name),
                lambda value: _is_integer(value, amount),
            ),
        )
    )


def _harness_valid(module: ast.Module) -> bool:
    if len(module.body) != 11:
        return False
    inventory, first, second, third, products, total, restock = module.body[4:]
    inventory_valid = (
        isinstance(inventory, ast.Assign)
        and len(inventory.targets) == 1
        and _is_name(inventory.targets[0], "inventory", ast.Store)
        and inventory.type_comment is None
        and isinstance(inventory.value, ast.Dict)
        and not inventory.value.keys
        and not inventory.value.values
    )
    products_valid = (
        isinstance(products, ast.Expr)
        and _is_call(
            products.value,
            "print",
            (
                lambda value: _is_string(value, "Products:"),
                lambda value: _is_call(value, "len", (lambda item: _is_name(item, "inventory"),)),
            ),
        )
    )
    total_valid = (
        isinstance(total, ast.Expr)
        and _is_call(
            total.value,
            "print",
            (
                lambda value: _is_string(value, "Total units:"),
                lambda value: _is_call(value, "total_stock", (lambda item: _is_name(item, "inventory"),)),
            ),
        )
    )
    restock_print = restock.body[0] if isinstance(restock, ast.For) and len(restock.body) == 1 else None
    restock_valid = (
        isinstance(restock, ast.For)
        and _is_name(restock.target, "name", ast.Store)
        and _is_call(
            restock.iter,
            "low_stock",
            (lambda value: _is_name(value, "inventory"), lambda value: _is_integer(value, 6)),
        )
        and not restock.orelse
        and restock.type_comment is None
        and isinstance(restock_print, ast.Expr)
        and _is_call(
            restock_print.value,
            "print",
            (lambda value: _is_string(value, "Restock:"), lambda value: _is_name(value, "name")),
        )
    )
    return (
        inventory_valid
        and _stock_call(first, " Markers ", 2)
        and _stock_call(second, "markers", 3)
        and _stock_call(third, "Paper", 12)
        and products_valid
        and total_valid
        and restock_valid
    )


def _authored_frame_valid(module: ast.Module) -> bool:
    return (
        not module.type_ignores
        and len(module.body) == 11
        and all(isinstance(statement, ast.FunctionDef) for statement in module.body[:4])
        and [statement.name for statement in module.body[:4] if isinstance(statement, ast.FunctionDef)]
        == ["normalize_name", "add_stock", "total_stock", "low_stock"]
        and all(
            _has_exact_arguments(statement, parameters)
            for statement, parameters in zip(
                module.body[:4],
                (("name",), ("inventory", "name", "amount"), ("inventory",), ("inventory", "limit")),
            )
            if isinstance(statement, ast.FunctionDef)
        )
        and isinstance(module.body[4], ast.Assign)
        and all(isinstance(statement, ast.Expr) for statement in module.body[5:10])
        and isinstance(module.body[10], ast.For)
    )


def _within_ast_budget(module: ast.Module) -> bool:
    count = 0
    stack: list[tuple[ast.AST, int]] = [(module, 1)]
    while stack:
        node, depth = stack.pop()
        count += 1
        if count > MAX_AST_NODES or depth > MAX_AST_DEPTH:
            return False
        stack.extend((child, depth + 1) for child in ast.iter_child_nodes(node))
    return True


def _uses_utf8(source: bytes) -> bool:
    try:
        encoding, _ = tokenize.detect_encoding(io.BytesIO(source).readline)
        return codecs.lookup(encoding).name in {"utf-8", "utf-8-sig"}
    except (LookupError, SyntaxError, UnicodeDecodeError):
        return False


def analyze_source(source: bytes) -> dict[str, object]:
    if len(source) > MAX_SOURCE_BYTES or not _uses_utf8(source):
        return _empty_result(analyzed=True, parsed=False)
    try:
        module = ast.parse(source, filename="/workspace/source.txt", mode="exec")
    except (MemoryError, RecursionError, SyntaxError, ValueError):
        return _empty_result(analyzed=True, parsed=False)
    if not _within_ast_budget(module):
        return _empty_result(analyzed=True, parsed=False)

    return {
        "version": 1,
        "profile": PROFILE,
        "analyzed": True,
        "parsed": True,
        "authored_frame": _authored_frame_valid(module),
        "normalize_name": _normalize_name_valid(module),
        "add_stock": _add_stock_valid(module),
        "total_stock": _total_stock_valid(module),
        "low_stock": _low_stock_valid(module),
        "harness": _harness_valid(module),
    }


def main(arguments: list[str]) -> int:
    if arguments != ["/workspace/source.txt"]:
        print(json.dumps(_empty_result(analyzed=False, parsed=False), separators=(",", ":")))
        return 2
    try:
        source = Path(arguments[0]).read_bytes()
        result = analyze_source(source)
    except (MemoryError, OSError):
        result = _empty_result(analyzed=False, parsed=False)
    print(json.dumps(result, separators=(",", ":"), sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
