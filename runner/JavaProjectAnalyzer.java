import com.sun.source.tree.ArrayTypeTree;
import com.sun.source.tree.BinaryTree;
import com.sun.source.tree.BlockTree;
import com.sun.source.tree.ClassTree;
import com.sun.source.tree.CompilationUnitTree;
import com.sun.source.tree.EnhancedForLoopTree;
import com.sun.source.tree.ExpressionStatementTree;
import com.sun.source.tree.ExpressionTree;
import com.sun.source.tree.IdentifierTree;
import com.sun.source.tree.IfTree;
import com.sun.source.tree.ImportTree;
import com.sun.source.tree.LiteralTree;
import com.sun.source.tree.MemberSelectTree;
import com.sun.source.tree.MethodInvocationTree;
import com.sun.source.tree.MethodTree;
import com.sun.source.tree.ModifiersTree;
import com.sun.source.tree.NewArrayTree;
import com.sun.source.tree.NewClassTree;
import com.sun.source.tree.ParenthesizedTree;
import com.sun.source.tree.PrimitiveTypeTree;
import com.sun.source.tree.StatementTree;
import com.sun.source.tree.Tree;
import com.sun.source.tree.VariableTree;
import com.sun.source.util.JavacTask;
import com.sun.source.util.SourcePositions;
import com.sun.source.util.TreeScanner;
import com.sun.source.util.Trees;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.lang.model.element.Modifier;
import javax.lang.model.type.TypeKind;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

public final class JavaProjectAnalyzer {
    private static final int SOURCE_LIMIT = 64 * 1024;
    private static final int NODE_LIMIT = 4096;
    private static final int DEPTH_LIMIT = 128;
    private static final int FACT_LIMIT = 16;
    private static final int FIELD_LIMIT = 16;
    private static final int IDENTIFIER_LIMIT = 128;
    private static final int TEXT_LIMIT = 256;
    private static final int TEXT_BUDGET_LIMIT = 4096;

    private JavaProjectAnalyzer() {
    }

    private static final class SourceFile extends SimpleJavaFileObject {
        private final String source;

        SourceFile(String source) {
            super(URI.create("string:///Main.java"), JavaFileObject.Kind.SOURCE);
            this.source = source;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return source;
        }
    }

    private static final class Budget {
        private int textBudget;

        boolean identifier(String value) {
            if (value.length() < 1 || value.length() > IDENTIFIER_LIMIT) {
                return false;
            }
            if (!isIdentifierStart(value.charAt(0))) {
                return false;
            }
            for (int index = 1; index < value.length(); index += 1) {
                if (!isIdentifierPart(value.charAt(index))) {
                    return false;
                }
            }
            return consume(value);
        }

        boolean text(String value) {
            return value.length() <= TEXT_LIMIT && isPlainText(value) && consume(value);
        }

        private boolean consume(String value) {
            textBudget += value.getBytes(StandardCharsets.UTF_8).length;
            return textBudget <= TEXT_BUDGET_LIMIT;
        }
    }

    private static final class ShapeScanner extends TreeScanner<Void, Integer> {
        private int count;
        private boolean valid = true;

        @Override
        public Void scan(Tree tree, Integer depth) {
            if (tree == null || !valid) {
                return null;
            }
            count += 1;
            if (count > NODE_LIMIT || depth > DEPTH_LIMIT) {
                valid = false;
                return null;
            }
            return super.scan(tree, depth + 1);
        }
    }

    private record OutputFact(List<String> parts, List<String> fields) {
    }

    private static final class AnalysisContext {
        final String source;
        final CompilationUnitTree unit;
        final SourcePositions positions;
        final Budget budget = new Budget();

        AnalysisContext(String source, CompilationUnitTree unit, SourcePositions positions) {
            this.source = source;
            this.unit = unit;
            this.positions = positions;
        }

        String slice(Tree tree) {
            long start = positions.getStartPosition(unit, tree);
            long end = positions.getEndPosition(unit, tree);
            if (start < 0 || end < start || end > source.length()) {
                return null;
            }
            return source.substring((int) start, (int) end);
        }
    }

    public static void main(String[] arguments) {
        Map<String, Object> result;
        try {
            result = analyze(arguments);
        } catch (Throwable error) {
            result = failed(true, false);
        }
        System.out.print(toJson(result));
    }

    private static Map<String, Object> analyze(String[] arguments) throws IOException {
        if (arguments.length != 1) {
            return failed(true, false);
        }

        Path sourcePath = Path.of(arguments[0]);
        if (!Files.isRegularFile(sourcePath, LinkOption.NOFOLLOW_LINKS)
                || Files.size(sourcePath) > SOURCE_LIMIT) {
            return failed(true, false);
        }
        byte[] sourceBytes = Files.readAllBytes(sourcePath);
        if (sourceBytes.length > SOURCE_LIMIT) {
            return failed(true, false);
        }

        String source;
        try {
            source = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(sourceBytes))
                    .toString();
        } catch (CharacterCodingException error) {
            return failed(true, false);
        }
        if (!isCanonicalAsciiSource(source)) {
            return failed(true, false);
        }

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            return failed(true, false);
        }

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        StringWriter compilerOutput = new StringWriter();
        try (StandardJavaFileManager fileManager = compiler.getStandardFileManager(
                diagnostics,
                null,
                StandardCharsets.UTF_8
        )) {
            List<String> options = List.of(
                    "--release", "21",
                    "-proc:none",
                    "-Xlint:none",
                    "-classpath", "/opt/runner/java/empty-classpath"
            );
            JavacTask task = (JavacTask) compiler.getTask(
                    compilerOutput,
                    fileManager,
                    diagnostics,
                    options,
                    null,
                    List.of(new SourceFile(source))
            );

            List<CompilationUnitTree> units = new ArrayList<>();
            for (CompilationUnitTree unit : task.parse()) {
                units.add(unit);
                if (units.size() > 1) {
                    return failed(true, false);
                }
            }
            if (units.size() != 1 || hasErrors(diagnostics)) {
                return failed(true, false);
            }

            CompilationUnitTree unit = units.get(0);
            ShapeScanner shapeScanner = new ShapeScanner();
            shapeScanner.scan(unit, 1);
            if (!shapeScanner.valid) {
                return failed(true, false);
            }

            Trees trees = Trees.instance(task);
            AnalysisContext context = new AnalysisContext(
                    source,
                    unit,
                    trees.getSourcePositions()
            );
            Map<String, Object> analysis = analyzeUnit(unit, context);

            // javac inserts a synthetic default constructor into the parsed
            // ClassTree during attribution. Capture the exact source shape
            // first, then run attribution only as a semantic-error gate.
            task.analyze();
            if (hasErrors(diagnostics)) {
                return failed(true, false);
            }
            return analysis;
        }
    }

    private static Map<String, Object> analyzeUnit(
            CompilationUnitTree unit,
            AnalysisContext context
    ) {
        boolean straightLine = unit.getPackageName() == null
                && unit.getPackageAnnotations().isEmpty()
                && unit.getModule() == null
                && unit.getImports().size() == 1
                && unit.getTypeDecls().size() == 1;

        List<String> imports = new ArrayList<>();
        for (ImportTree importTree : unit.getImports()) {
            String importName = parseImport(importTree, context.budget);
            if (importName == null || imports.size() >= FACT_LIMIT) {
                straightLine = false;
            } else {
                imports.add(importName);
            }
        }

        boolean classSignature = false;
        List<Map<String, Object>> mainMethods = new ArrayList<>();
        List<Map<String, Object>> staticMethods = new ArrayList<>();
        List<Map<String, Object>> scanners = new ArrayList<>();
        List<Map<String, Object>> arrays = new ArrayList<>();
        List<Map<String, Object>> inputs = new ArrayList<>();
        List<Map<String, Object>> writes = new ArrayList<>();
        List<Map<String, Object>> conditionals = new ArrayList<>();
        List<Map<String, Object>> foreachLoops = new ArrayList<>();
        List<Map<String, Object>> calls = new ArrayList<>();

        if (unit.getTypeDecls().size() == 1 && unit.getTypeDecls().get(0) instanceof ClassTree classTree) {
            classSignature = isClassSignature(classTree);
            if (!classSignature || classTree.getMembers().size() != 2) {
                straightLine = false;
            }

            for (int memberIndex = 0; memberIndex < classTree.getMembers().size(); memberIndex += 1) {
                Tree member = classTree.getMembers().get(memberIndex);
                int memberNumber = memberIndex + 1;
                if (!(member instanceof MethodTree methodTree)) {
                    straightLine = false;
                    continue;
                }

                if (isMainSignature(methodTree, context)) {
                    if (mainMethods.size() >= FACT_LIMIT || !analyzeMain(
                            methodTree,
                            memberNumber,
                            context,
                            scanners,
                            arrays,
                            inputs,
                            writes,
                            conditionals,
                            foreachLoops,
                            calls
                    )) {
                        straightLine = false;
                        continue;
                    }
                    mainMethods.add(mapOf(
                            "occurrence", mainMethods.size() + 1,
                            "member", memberNumber
                    ));
                    continue;
                }

                Map<String, Object> methodFact = parseStaticMethod(
                        methodTree,
                        memberNumber,
                        staticMethods.size() + 1,
                        context
                );
                if (methodFact == null || staticMethods.size() >= FACT_LIMIT) {
                    straightLine = false;
                } else {
                    staticMethods.add(methodFact);
                }
            }
        } else {
            straightLine = false;
        }

        if (imports.size() != 1
                || !classSignature
                || mainMethods.size() != 1
                || staticMethods.size() != 1
                || scanners.size() != 1
                || arrays.size() != 1
                || inputs.size() != 2
                || writes.size() != 2
                || conditionals.size() != 1
                || foreachLoops.size() != 1
                || calls.size() != 1) {
            straightLine = false;
        }

        if (!straightLine) {
            return failed(true, false);
        }

        return mapOf(
                "version", 1,
                "analyzed", true,
                "parsed", true,
                "straight_line", true,
                "imports", imports,
                "class_signature", true,
                "main_methods", mainMethods,
                "static_methods", staticMethods,
                "scanner_declarations", scanners,
                "arrays", arrays,
                "inputs", inputs,
                "writes", writes,
                "conditionals", conditionals,
                "foreach_loops", foreachLoops,
                "calls", calls
        );
    }

    private static boolean analyzeMain(
            MethodTree mainMethod,
            int member,
            AnalysisContext context,
            List<Map<String, Object>> scanners,
            List<Map<String, Object>> arrays,
            List<Map<String, Object>> inputs,
            List<Map<String, Object>> writes,
            List<Map<String, Object>> conditionals,
            List<Map<String, Object>> foreachLoops,
            List<Map<String, Object>> calls
    ) {
        BlockTree body = mainMethod.getBody();
        if (body == null || body.getStatements().size() != 9 || member < 1) {
            return false;
        }

        boolean valid = true;
        List<? extends StatementTree> statements = body.getStatements();
        for (int index = 0; index < statements.size(); index += 1) {
            StatementTree statement = statements.get(index);
            int statementNumber = index + 1;

            if (statement instanceof VariableTree variable) {
                Map<String, Object> scannerFact = parseScanner(
                        variable,
                        statementNumber,
                        scanners.size() + 1,
                        context
                );
                if (scannerFact != null) {
                    if (scanners.size() >= FACT_LIMIT) {
                        valid = false;
                    } else {
                        scanners.add(scannerFact);
                    }
                    continue;
                }

                Map<String, Object> arrayFact = parseArray(
                        variable,
                        statementNumber,
                        arrays.size() + 1,
                        context
                );
                if (arrayFact != null) {
                    if (arrays.size() >= FACT_LIMIT) {
                        valid = false;
                    } else {
                        arrays.add(arrayFact);
                    }
                    continue;
                }

                Map<String, Object> inputFact = parseInput(
                        variable,
                        statementNumber,
                        inputs.size() + 1,
                        context
                );
                if (inputFact != null) {
                    if (inputs.size() >= FACT_LIMIT) {
                        valid = false;
                    } else {
                        inputs.add(inputFact);
                    }
                    continue;
                }

                valid = false;
                continue;
            }

            if (statement instanceof ExpressionStatementTree expressionStatement) {
                Map<String, Object> writeFact = parseLiteralWrite(
                        expressionStatement,
                        statementNumber,
                        writes.size() + 1,
                        context
                );
                if (writeFact != null) {
                    if (writes.size() >= FACT_LIMIT) {
                        valid = false;
                    } else {
                        writes.add(writeFact);
                    }
                    continue;
                }

                Map<String, Object> callFact = parseDirectCall(
                        expressionStatement,
                        statementNumber,
                        calls.size() + 1,
                        context
                );
                if (callFact != null) {
                    if (calls.size() >= FACT_LIMIT) {
                        valid = false;
                    } else {
                        calls.add(callFact);
                    }
                    continue;
                }

                valid = false;
                continue;
            }

            if (statement instanceof IfTree ifTree) {
                Map<String, Object> fact = parseConditional(
                        ifTree,
                        statementNumber,
                        conditionals.size() + 1,
                        context
                );
                if (fact == null || conditionals.size() >= FACT_LIMIT) {
                    valid = false;
                } else {
                    conditionals.add(fact);
                }
                continue;
            }

            if (statement instanceof EnhancedForLoopTree foreachTree) {
                Map<String, Object> fact = parseForeach(
                        foreachTree,
                        statementNumber,
                        foreachLoops.size() + 1,
                        context
                );
                if (fact == null || foreachLoops.size() >= FACT_LIMIT) {
                    valid = false;
                } else {
                    foreachLoops.add(fact);
                }
                continue;
            }

            valid = false;
        }
        return valid;
    }

    private static Map<String, Object> parseStaticMethod(
            MethodTree method,
            int member,
            int occurrence,
            AnalysisContext context
    ) {
        if (!plainMethod(method)
                || !exactModifiers(method.getModifiers(), EnumSet.of(Modifier.STATIC))
                || !isPrimitiveType(method.getReturnType(), TypeKind.VOID)
                || method.getParameters().size() != 2
                || method.getBody() == null
                || method.getBody().getStatements().size() != 1) {
            return null;
        }

        String name = method.getName().toString();
        if (!context.budget.identifier(name)) {
            return null;
        }

        List<Map<String, Object>> parameters = new ArrayList<>();
        for (int index = 0; index < method.getParameters().size(); index += 1) {
            VariableTree parameter = method.getParameters().get(index);
            String expectedType = index == 0 ? "String" : "int";
            if (!plainParameter(parameter)
                    || !isType(parameter.getType(), expectedType)
                    || containsVarargs(parameter, context)) {
                return null;
            }
            String parameterName = parameter.getName().toString();
            if (!context.budget.identifier(parameterName)) {
                return null;
            }
            parameters.add(mapOf(
                    "position", index + 1,
                    "name", parameterName,
                    "type", expectedType
            ));
        }

        StatementTree bodyStatement = method.getBody().getStatements().get(0);
        if (!(bodyStatement instanceof ExpressionStatementTree expressionStatement)) {
            return null;
        }
        OutputFact output = parsePrintlnOutput(expressionStatement, context);
        if (output == null) {
            return null;
        }

        return mapOf(
                "occurrence", occurrence,
                "member", member,
                "name", name,
                "return_type", "void",
                "parameters", parameters,
                "output", outputObject(output)
        );
    }

    private static boolean isMainSignature(MethodTree method, AnalysisContext context) {
        if (!plainMethod(method)
                || !exactModifiers(method.getModifiers(), EnumSet.of(Modifier.PUBLIC, Modifier.STATIC))
                || method.getName().contentEquals("main") == false
                || !isPrimitiveType(method.getReturnType(), TypeKind.VOID)
                || method.getParameters().size() != 1
                || method.getBody() == null) {
            return false;
        }
        VariableTree parameter = method.getParameters().get(0);
        return plainParameter(parameter)
                && parameter.getName().contentEquals("args")
                && isStringArrayType(parameter.getType())
                && !containsVarargs(parameter, context);
    }

    private static boolean isClassSignature(ClassTree classTree) {
        return classTree.getKind() == Tree.Kind.CLASS
                && classTree.getSimpleName().contentEquals("Main")
                && exactModifiers(classTree.getModifiers(), EnumSet.of(Modifier.PUBLIC))
                && classTree.getTypeParameters().isEmpty()
                && classTree.getExtendsClause() == null
                && classTree.getImplementsClause().isEmpty()
                && classTree.getPermitsClause().isEmpty();
    }

    private static Map<String, Object> parseScanner(
            VariableTree variable,
            int statement,
            int occurrence,
            AnalysisContext context
    ) {
        if (!plainLocal(variable)
                || !isIdentifier(variable.getType(), "Scanner")
                || !(variable.getInitializer() instanceof NewClassTree constructor)
                || constructor.getEnclosingExpression() != null
                || !constructor.getTypeArguments().isEmpty()
                || !isIdentifier(constructor.getIdentifier(), "Scanner")
                || constructor.getArguments().size() != 1
                || !isMember(constructor.getArguments().get(0), "System", "in")
                || constructor.getClassBody() != null) {
            return null;
        }
        String target = variable.getName().toString();
        if (!context.budget.identifier(target)) {
            return null;
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statement,
                "target", target,
                "kind", "scanner_system_in"
        );
    }

    private static Map<String, Object> parseArray(
            VariableTree variable,
            int statement,
            int occurrence,
            AnalysisContext context
    ) {
        if (!plainLocal(variable)
                || !isStringArrayType(variable.getType())
                || !(variable.getInitializer() instanceof NewArrayTree initializer)
                || initializer.getType() != null
                || !initializer.getDimensions().isEmpty()
                || initializer.getInitializers() == null
                || initializer.getInitializers().size() > FIELD_LIMIT) {
            return null;
        }

        String target = variable.getName().toString();
        if (!context.budget.identifier(target)) {
            return null;
        }
        List<String> values = new ArrayList<>();
        for (ExpressionTree expression : initializer.getInitializers()) {
            String value = parseStringLiteral(expression, context);
            if (value == null) {
                return null;
            }
            values.add(value);
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statement,
                "target", target,
                "element_type", "String",
                "values", values
        );
    }

    private static Map<String, Object> parseInput(
            VariableTree variable,
            int statement,
            int occurrence,
            AnalysisContext context
    ) {
        if (!plainLocal(variable)) {
            return null;
        }
        String target = variable.getName().toString();
        if (!context.budget.identifier(target)) {
            return null;
        }

        String kind;
        String receiver;
        if (isIdentifier(variable.getType(), "String")) {
            receiver = parseScannerNextLine(variable.getInitializer(), context.budget);
            kind = "scanner_next_line";
        } else if (isPrimitiveType(variable.getType(), TypeKind.INT)
                && variable.getInitializer() instanceof MethodInvocationTree parseInvocation
                && parseInvocation.getTypeArguments().isEmpty()
                && isMember(parseInvocation.getMethodSelect(), "Integer", "parseInt")
                && parseInvocation.getArguments().size() == 1) {
            receiver = parseScannerNextLine(
                    parseInvocation.getArguments().get(0),
                    context.budget
            );
            kind = "integer_parse_scanner_next_line";
        } else {
            return null;
        }
        if (receiver == null) {
            return null;
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statement,
                "target", target,
                "kind", kind,
                "receiver", receiver
        );
    }

    private static String parseScannerNextLine(ExpressionTree expression, Budget budget) {
        if (!(expression instanceof MethodInvocationTree invocation)
                || !invocation.getTypeArguments().isEmpty()
                || !invocation.getArguments().isEmpty()
                || !(invocation.getMethodSelect() instanceof MemberSelectTree member)
                || !member.getIdentifier().contentEquals("nextLine")
                || !(member.getExpression() instanceof IdentifierTree receiverTree)) {
            return null;
        }
        String receiver = receiverTree.getName().toString();
        return budget.identifier(receiver) ? receiver : null;
    }

    private static Map<String, Object> parseLiteralWrite(
            ExpressionStatementTree statement,
            int statementNumber,
            int occurrence,
            AnalysisContext context
    ) {
        MethodInvocationTree invocation = printlnInvocation(statement.getExpression());
        if (invocation == null || invocation.getArguments().size() != 1) {
            return null;
        }
        String text = parseStringLiteral(invocation.getArguments().get(0), context);
        if (text == null) {
            return null;
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statementNumber,
                "text", text
        );
    }

    private static Map<String, Object> parseConditional(
            IfTree ifTree,
            int statement,
            int occurrence,
            AnalysisContext context
    ) {
        ExpressionTree condition = ifTree.getCondition();
        if (condition instanceof ParenthesizedTree parentheses) {
            condition = parentheses.getExpression();
        }
        if (!(condition instanceof BinaryTree binary)
                || binary.getKind() != Tree.Kind.GREATER_THAN_EQUAL
                || !(binary.getLeftOperand() instanceof IdentifierTree leftTree)) {
            return null;
        }
        String left = leftTree.getName().toString();
        Integer right = parseCanonicalInteger(binary.getRightOperand(), context);
        if (!context.budget.identifier(left) || right == null) {
            return null;
        }

        String whenTrue = parseSingleLiteralBlock(ifTree.getThenStatement(), context);
        String whenFalse = parseSingleLiteralBlock(ifTree.getElseStatement(), context);
        if (whenTrue == null || whenFalse == null) {
            return null;
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statement,
                "left", left,
                "operator", ">=",
                "right", right,
                "when_true", whenTrue,
                "when_false", whenFalse
        );
    }

    private static String parseSingleLiteralBlock(StatementTree statement, AnalysisContext context) {
        if (!(statement instanceof BlockTree block) || block.getStatements().size() != 1) {
            return null;
        }
        StatementTree bodyStatement = block.getStatements().get(0);
        if (!(bodyStatement instanceof ExpressionStatementTree expressionStatement)) {
            return null;
        }
        MethodInvocationTree invocation = printlnInvocation(expressionStatement.getExpression());
        if (invocation == null || invocation.getArguments().size() != 1) {
            return null;
        }
        return parseStringLiteral(invocation.getArguments().get(0), context);
    }

    private static Map<String, Object> parseForeach(
            EnhancedForLoopTree foreachTree,
            int statement,
            int occurrence,
            AnalysisContext context
    ) {
        VariableTree variable = foreachTree.getVariable();
        if (!plainParameter(variable)
                || !isIdentifier(variable.getType(), "String")
                || !(foreachTree.getExpression() instanceof IdentifierTree collectionTree)
                || !(foreachTree.getStatement() instanceof BlockTree block)
                || block.getStatements().size() != 1
                || !(block.getStatements().get(0) instanceof ExpressionStatementTree outputStatement)) {
            return null;
        }
        String target = variable.getName().toString();
        String collection = collectionTree.getName().toString();
        if (!context.budget.identifier(target) || !context.budget.identifier(collection)) {
            return null;
        }
        OutputFact output = parsePrintlnOutput(outputStatement, context);
        if (output == null) {
            return null;
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statement,
                "element_type", "String",
                "target", target,
                "collection", collection,
                "output", outputObject(output)
        );
    }

    private static Map<String, Object> parseDirectCall(
            ExpressionStatementTree statement,
            int statementNumber,
            int occurrence,
            AnalysisContext context
    ) {
        if (!(statement.getExpression() instanceof MethodInvocationTree invocation)
                || !invocation.getTypeArguments().isEmpty()
                || !(invocation.getMethodSelect() instanceof IdentifierTree targetTree)
                || invocation.getArguments().size() > FIELD_LIMIT) {
            return null;
        }
        String target = targetTree.getName().toString();
        if (!context.budget.identifier(target)) {
            return null;
        }
        List<String> arguments = new ArrayList<>();
        for (ExpressionTree argument : invocation.getArguments()) {
            if (!(argument instanceof IdentifierTree identifierTree)) {
                return null;
            }
            String name = identifierTree.getName().toString();
            if (!context.budget.identifier(name)) {
                return null;
            }
            arguments.add(name);
        }
        return mapOf(
                "occurrence", occurrence,
                "statement", statementNumber,
                "target", target,
                "arguments", arguments
        );
    }

    private static OutputFact parsePrintlnOutput(
            ExpressionStatementTree statement,
            AnalysisContext context
    ) {
        MethodInvocationTree invocation = printlnInvocation(statement.getExpression());
        if (invocation == null || invocation.getArguments().size() != 1) {
            return null;
        }
        List<ExpressionTree> operands = new ArrayList<>();
        flattenPlus(invocation.getArguments().get(0), operands);
        if (operands.isEmpty() || operands.size() > FIELD_LIMIT * 2 + 1) {
            return null;
        }

        List<String> parts = new ArrayList<>();
        List<String> fields = new ArrayList<>();
        parts.add("");
        for (ExpressionTree operand : operands) {
            String literal = parseStringLiteral(operand, context);
            if (literal != null) {
                int last = parts.size() - 1;
                String combined = parts.get(last) + literal;
                if (combined.length() > TEXT_LIMIT) {
                    return null;
                }
                parts.set(last, combined);
                continue;
            }
            if (!(operand instanceof IdentifierTree identifierTree) || fields.size() >= FIELD_LIMIT) {
                return null;
            }
            String field = identifierTree.getName().toString();
            if (!context.budget.identifier(field)) {
                return null;
            }
            fields.add(field);
            parts.add("");
        }
        return parts.size() == fields.size() + 1
                ? new OutputFact(parts, fields)
                : null;
    }

    private static void flattenPlus(ExpressionTree expression, List<ExpressionTree> operands) {
        if (expression instanceof BinaryTree binary && binary.getKind() == Tree.Kind.PLUS) {
            flattenPlus(binary.getLeftOperand(), operands);
            flattenPlus(binary.getRightOperand(), operands);
        } else {
            operands.add(expression);
        }
    }

    private static MethodInvocationTree printlnInvocation(ExpressionTree expression) {
        if (!(expression instanceof MethodInvocationTree invocation)
                || !invocation.getTypeArguments().isEmpty()
                || !isSystemOutPrintln(invocation.getMethodSelect())) {
            return null;
        }
        return invocation;
    }

    private static boolean isSystemOutPrintln(ExpressionTree methodSelect) {
        return methodSelect instanceof MemberSelectTree println
                && println.getIdentifier().contentEquals("println")
                && println.getExpression() instanceof MemberSelectTree out
                && out.getIdentifier().contentEquals("out")
                && out.getExpression() instanceof IdentifierTree system
                && system.getName().contentEquals("System");
    }

    private static String parseStringLiteral(ExpressionTree expression, AnalysisContext context) {
        if (!(expression instanceof LiteralTree literal)
                || literal.getKind() != Tree.Kind.STRING_LITERAL
                || !(literal.getValue() instanceof String value)
                || !context.budget.text(value)) {
            return null;
        }
        String raw = context.slice(literal);
        return raw != null && raw.equals("\"" + value + "\"") ? value : null;
    }

    private static Integer parseCanonicalInteger(ExpressionTree expression, AnalysisContext context) {
        if (!(expression instanceof LiteralTree literal)
                || literal.getKind() != Tree.Kind.INT_LITERAL
                || !(literal.getValue() instanceof Integer value)
                || value < 0) {
            return null;
        }
        String raw = context.slice(literal);
        return raw != null && raw.equals(Integer.toString(value)) ? value : null;
    }

    private static String parseImport(ImportTree importTree, Budget budget) {
        if (importTree.isStatic()) {
            return null;
        }
        String name = qualifiedName(importTree.getQualifiedIdentifier());
        return name != null && budget.text(name) ? name : null;
    }

    private static String qualifiedName(Tree tree) {
        if (tree instanceof IdentifierTree identifier) {
            String name = identifier.getName().toString();
            return isIdentifier(name) ? name : null;
        }
        if (tree instanceof MemberSelectTree member) {
            String prefix = qualifiedName(member.getExpression());
            String suffix = member.getIdentifier().toString();
            if (prefix == null || !isIdentifier(suffix)) {
                return null;
            }
            return prefix + "." + suffix;
        }
        return null;
    }

    private static boolean isMember(ExpressionTree tree, String receiver, String memberName) {
        return tree instanceof MemberSelectTree member
                && member.getIdentifier().contentEquals(memberName)
                && member.getExpression() instanceof IdentifierTree identifier
                && identifier.getName().contentEquals(receiver);
    }

    private static boolean isIdentifier(Tree tree, String expected) {
        return tree instanceof IdentifierTree identifier
                && identifier.getName().contentEquals(expected);
    }

    private static boolean isPrimitiveType(Tree tree, TypeKind kind) {
        return tree instanceof PrimitiveTypeTree primitive && primitive.getPrimitiveTypeKind() == kind;
    }

    private static boolean isType(Tree tree, String expected) {
        return expected.equals("int")
                ? isPrimitiveType(tree, TypeKind.INT)
                : isIdentifier(tree, expected);
    }

    private static boolean isStringArrayType(Tree tree) {
        return tree instanceof ArrayTypeTree arrayType
                && isIdentifier(arrayType.getType(), "String");
    }

    private static boolean containsVarargs(VariableTree parameter, AnalysisContext context) {
        String source = context.slice(parameter);
        return source == null || source.contains("...");
    }

    private static boolean plainMethod(MethodTree method) {
        return method.getReturnType() != null
                && method.getTypeParameters().isEmpty()
                && method.getReceiverParameter() == null
                && method.getThrows().isEmpty()
                && method.getDefaultValue() == null;
    }

    private static boolean plainParameter(VariableTree variable) {
        return exactModifiers(variable.getModifiers(), EnumSet.noneOf(Modifier.class))
                && variable.getInitializer() == null;
    }

    private static boolean plainLocal(VariableTree variable) {
        return exactModifiers(variable.getModifiers(), EnumSet.noneOf(Modifier.class))
                && variable.getInitializer() != null;
    }

    private static boolean exactModifiers(ModifiersTree modifiers, Set<Modifier> expected) {
        return modifiers.getAnnotations().isEmpty() && modifiers.getFlags().equals(expected);
    }

    private static boolean hasErrors(DiagnosticCollector<JavaFileObject> diagnostics) {
        for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
            if (diagnostic.getKind() == Diagnostic.Kind.ERROR) {
                return true;
            }
        }
        return false;
    }

    private static boolean isCanonicalAsciiSource(String source) {
        for (int index = 0; index < source.length(); index += 1) {
            char character = source.charAt(index);
            if (character == '\\') {
                return false;
            }
            if (character == '\t' || character == '\n' || character == '\r') {
                continue;
            }
            if (character < ' ' || character > '~') {
                return false;
            }
        }
        return true;
    }

    private static boolean isPlainText(String value) {
        for (int index = 0; index < value.length(); index += 1) {
            char character = value.charAt(index);
            if (character < ' ' || character > '~' || character == '\"' || character == '\\') {
                return false;
            }
        }
        return true;
    }

    private static boolean isIdentifier(String value) {
        if (value.length() < 1 || value.length() > IDENTIFIER_LIMIT
                || !isIdentifierStart(value.charAt(0))) {
            return false;
        }
        for (int index = 1; index < value.length(); index += 1) {
            if (!isIdentifierPart(value.charAt(index))) {
                return false;
            }
        }
        return true;
    }

    private static boolean isIdentifierStart(char value) {
        return value == '_' || value >= 'A' && value <= 'Z' || value >= 'a' && value <= 'z';
    }

    private static boolean isIdentifierPart(char value) {
        return isIdentifierStart(value) || value >= '0' && value <= '9';
    }

    private static Map<String, Object> outputObject(OutputFact output) {
        return mapOf("parts", output.parts(), "fields", output.fields());
    }

    private static Map<String, Object> failed(boolean analyzed, boolean parsed) {
        return mapOf(
                "version", 1,
                "analyzed", analyzed,
                "parsed", parsed,
                "straight_line", false,
                "imports", List.of(),
                "class_signature", false,
                "main_methods", List.of(),
                "static_methods", List.of(),
                "scanner_declarations", List.of(),
                "arrays", List.of(),
                "inputs", List.of(),
                "writes", List.of(),
                "conditionals", List.of(),
                "foreach_loops", List.of(),
                "calls", List.of()
        );
    }

    private static Map<String, Object> mapOf(Object... values) {
        if (values.length % 2 != 0) {
            throw new IllegalArgumentException("map entries must be key-value pairs");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        for (int index = 0; index < values.length; index += 2) {
            result.put((String) values[index], values[index + 1]);
        }
        return result;
    }

    private static String toJson(Object value) {
        StringBuilder output = new StringBuilder();
        appendJson(output, value);
        return output.toString();
    }

    private static void appendJson(StringBuilder output, Object value) {
        if (value == null) {
            output.append("null");
            return;
        }
        if (value instanceof String text) {
            appendJsonString(output, text);
            return;
        }
        if (value instanceof Boolean || value instanceof Integer || value instanceof Long) {
            output.append(value);
            return;
        }
        if (value instanceof Map<?, ?> map) {
            output.append('{');
            Iterator<? extends Map.Entry<?, ?>> iterator = map.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<?, ?> entry = iterator.next();
                appendJsonString(output, (String) entry.getKey());
                output.append(':');
                appendJson(output, entry.getValue());
                if (iterator.hasNext()) {
                    output.append(',');
                }
            }
            output.append('}');
            return;
        }
        if (value instanceof Iterable<?> iterable) {
            output.append('[');
            Iterator<?> iterator = iterable.iterator();
            while (iterator.hasNext()) {
                appendJson(output, iterator.next());
                if (iterator.hasNext()) {
                    output.append(',');
                }
            }
            output.append(']');
            return;
        }
        throw new IllegalArgumentException("unsupported JSON value");
    }

    private static void appendJsonString(StringBuilder output, String value) {
        output.append('\"');
        for (int index = 0; index < value.length(); index += 1) {
            char character = value.charAt(index);
            switch (character) {
                case '\"' -> output.append("\\\"");
                case '\\' -> output.append("\\\\");
                case '\b' -> output.append("\\b");
                case '\f' -> output.append("\\f");
                case '\n' -> output.append("\\n");
                case '\r' -> output.append("\\r");
                case '\t' -> output.append("\\t");
                default -> {
                    if (character < 0x20) {
                        output.append(String.format("\\u%04x", (int) character));
                    } else {
                        output.append(character);
                    }
                }
            }
        }
        output.append('\"');
    }
}
