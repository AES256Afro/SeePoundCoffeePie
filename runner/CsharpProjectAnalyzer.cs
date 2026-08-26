using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;

internal static class CsharpProjectAnalyzer
{
    private const int SourceLimit = 64 * 1024;
    private const int NodeLimit = 4096;
    private const int DepthLimit = 128;
    private const int StatementLimit = 64;
    private const int FactLimit = 16;
    private const int FieldLimit = 16;
    private const int IdentifierLimit = 128;
    private const int TextLimit = 256;
    private const int TextBudgetLimit = 4096;

    private sealed class Budget
    {
        private int textBudget;

        public bool Identifier(string value)
        {
            if (value.Length is < 1 or > IdentifierLimit)
            {
                return false;
            }

            if (!IsAsciiIdentifierStart(value[0]))
            {
                return false;
            }

            for (var index = 1; index < value.Length; index += 1)
            {
                if (!IsAsciiIdentifierPart(value[index]))
                {
                    return false;
                }
            }

            return Consume(value);
        }

        public bool Text(string value)
        {
            return value.Length <= TextLimit && Consume(value);
        }

        private bool Consume(string value)
        {
            textBudget += Encoding.UTF8.GetByteCount(value);
            return textBudget <= TextBudgetLimit;
        }

        private static bool IsAsciiIdentifierStart(char value)
        {
            return value is >= 'A' and <= 'Z'
                or >= 'a' and <= 'z'
                or '_';
        }

        private static bool IsAsciiIdentifierPart(char value)
        {
            return IsAsciiIdentifierStart(value) || value is >= '0' and <= '9';
        }
    }

    private sealed record InterpolationFact(List<string> Parts, List<string> Fields);

    public static int Main(string[] arguments)
    {
        Dictionary<string, object?> result;
        try
        {
            result = Analyze(arguments);
        }
        catch
        {
            result = Failed(analyzed: true, parsed: false);
        }

        Console.Out.Write(JsonSerializer.Serialize(result));
        return 0;
    }

    private static Dictionary<string, object?> Analyze(string[] arguments)
    {
        if (arguments.Length != 1)
        {
            return Failed(analyzed: true, parsed: false);
        }

        var sourcePath = arguments[0];
        var sourceInfo = new FileInfo(sourcePath);
        if (!sourceInfo.Exists || sourceInfo.Length > SourceLimit)
        {
            return Failed(analyzed: true, parsed: false);
        }

        var sourceBytes = File.ReadAllBytes(sourcePath);
        if (sourceBytes.Length > SourceLimit || Array.IndexOf(sourceBytes, (byte)0) >= 0)
        {
            return Failed(analyzed: true, parsed: false);
        }

        string source;
        try
        {
            source = new UTF8Encoding(
                encoderShouldEmitUTF8Identifier: false,
                throwOnInvalidBytes: true
            ).GetString(sourceBytes);
        }
        catch (DecoderFallbackException)
        {
            return Failed(analyzed: true, parsed: false);
        }

        var syntaxTree = CSharpSyntaxTree.ParseText(
            SourceText.From(source, Encoding.UTF8),
            new CSharpParseOptions(
                languageVersion: LanguageVersion.CSharp12,
                documentationMode: DocumentationMode.Diagnose,
                kind: SourceCodeKind.Regular
            ),
            path: sourcePath
        );
        var root = syntaxTree.GetCompilationUnitRoot();
        if (root.GetDiagnostics().Any(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error))
        {
            return Failed(analyzed: true, parsed: false);
        }

        var trivia = root.DescendantTrivia(descendIntoTrivia: true);
        if (trivia.Any(item => item.IsDirective || item.IsKind(SyntaxKind.DisabledTextTrivia)))
        {
            return Failed(analyzed: true, parsed: false);
        }

        var nodes = root.DescendantNodes(descendIntoTrivia: false).Take(NodeLimit + 1).ToList();
        if (nodes.Count > NodeLimit)
        {
            return Failed(analyzed: true, parsed: false);
        }
        foreach (var node in nodes)
        {
            if (node.Ancestors().Take(DepthLimit + 1).Count() > DepthLimit)
            {
                return Failed(analyzed: true, parsed: false);
            }
        }

        if (HasSemanticErrors(syntaxTree))
        {
            return Failed(analyzed: true, parsed: false);
        }

        var budget = new Budget();
        var straightLine = root.Externs.Count == 0
            && root.AttributeLists.Count == 0
            && root.Usings.Count == 1
            && root.Members.Count == 9
            && root.Members.Count <= StatementLimit;

        var usings = new List<string>();
        foreach (var usingDirective in root.Usings)
        {
            if (!TryUsing(usingDirective, budget, out var usingName))
            {
                straightLine = false;
                continue;
            }
            usings.Add(usingName);
        }

        var localFunctions = new List<object>();
        var arrays = new List<object>();
        var inputs = new List<object>();
        var writes = new List<object>();
        var conditionals = new List<object>();
        var foreachLoops = new List<object>();
        var calls = new List<object>();

        for (var memberIndex = 0; memberIndex < root.Members.Count; memberIndex += 1)
        {
            if (root.Members[memberIndex] is not GlobalStatementSyntax globalStatement)
            {
                straightLine = false;
                continue;
            }

            var statement = globalStatement.Statement;
            var statementNumber = memberIndex + 1;
            if (statement is LocalFunctionStatementSyntax localFunction)
            {
                if (localFunctions.Count >= FactLimit
                    || !TryLocalFunction(localFunction, statementNumber, localFunctions.Count + 1, budget, out var fact))
                {
                    straightLine = false;
                    continue;
                }
                localFunctions.Add(fact);
                continue;
            }

            if (statement is LocalDeclarationStatementSyntax declaration)
            {
                if (TryArray(declaration, statementNumber, arrays.Count + 1, budget, out var arrayFact))
                {
                    if (arrays.Count >= FactLimit)
                    {
                        straightLine = false;
                    }
                    else
                    {
                        arrays.Add(arrayFact);
                    }
                    continue;
                }
                if (TryInput(declaration, statementNumber, inputs.Count + 1, budget, out var inputFact))
                {
                    if (inputs.Count >= FactLimit)
                    {
                        straightLine = false;
                    }
                    else
                    {
                        inputs.Add(inputFact);
                    }
                    continue;
                }
                straightLine = false;
                continue;
            }

            if (statement is ExpressionStatementSyntax expressionStatement)
            {
                if (TryLiteralWrite(expressionStatement, statementNumber, writes.Count + 1, budget, out var writeFact))
                {
                    if (writes.Count >= FactLimit)
                    {
                        straightLine = false;
                    }
                    else
                    {
                        writes.Add(writeFact);
                    }
                    continue;
                }
                if (TryDirectCall(expressionStatement, statementNumber, calls.Count + 1, budget, out var callFact))
                {
                    if (calls.Count >= FactLimit)
                    {
                        straightLine = false;
                    }
                    else
                    {
                        calls.Add(callFact);
                    }
                    continue;
                }
                straightLine = false;
                continue;
            }

            if (statement is IfStatementSyntax ifStatement)
            {
                if (conditionals.Count >= FactLimit
                    || !TryConditional(ifStatement, statementNumber, conditionals.Count + 1, budget, out var fact))
                {
                    straightLine = false;
                    continue;
                }
                conditionals.Add(fact);
                continue;
            }

            if (statement is ForEachStatementSyntax foreachStatement)
            {
                if (foreachLoops.Count >= FactLimit
                    || !TryForeach(foreachStatement, statementNumber, foreachLoops.Count + 1, budget, out var fact))
                {
                    straightLine = false;
                    continue;
                }
                foreachLoops.Add(fact);
                continue;
            }

            straightLine = false;
        }

        if (usings.Count != 1
            || localFunctions.Count != 1
            || arrays.Count != 1
            || inputs.Count != 2
            || writes.Count != 2
            || conditionals.Count != 1
            || foreachLoops.Count != 1
            || calls.Count != 1)
        {
            straightLine = false;
        }

        if (!straightLine)
        {
            return Failed(analyzed: true, parsed: false);
        }

        return new Dictionary<string, object?>
        {
            ["version"] = 1,
            ["analyzed"] = true,
            ["parsed"] = true,
            ["straight_line"] = straightLine,
            ["usings"] = usings,
            ["local_functions"] = localFunctions,
            ["arrays"] = arrays,
            ["inputs"] = inputs,
            ["writes"] = writes,
            ["conditionals"] = conditionals,
            ["foreach_loops"] = foreachLoops,
            ["calls"] = calls,
        };
    }

    private static bool HasSemanticErrors(SyntaxTree syntaxTree)
    {
        var trustedPlatformAssemblies = AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES") as string;
        if (string.IsNullOrEmpty(trustedPlatformAssemblies))
        {
            return true;
        }

        var references = trustedPlatformAssemblies
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries)
            .Select(path => MetadataReference.CreateFromFile(path));
        var compilation = CSharpCompilation.Create(
            assemblyName: "CadetStructuralCheck",
            syntaxTrees: new[] { syntaxTree },
            references: references,
            options: new CSharpCompilationOptions(
                outputKind: OutputKind.ConsoleApplication,
                allowUnsafe: false,
                nullableContextOptions: NullableContextOptions.Enable
            )
        );
        return compilation.GetDiagnostics().Any(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error);
    }

    private static bool TryUsing(UsingDirectiveSyntax syntax, Budget budget, out string name)
    {
        name = string.Empty;
        if (syntax.Alias is not null
            || !syntax.GlobalKeyword.IsKind(SyntaxKind.None)
            || !syntax.StaticKeyword.IsKind(SyntaxKind.None)
            || syntax.Name is not IdentifierNameSyntax identifier)
        {
            return false;
        }
        return TryCanonicalIdentifier(identifier.Identifier, budget, out name);
    }

    private static bool TryLocalFunction(
        LocalFunctionStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (syntax.AttributeLists.Count != 0
            || syntax.Modifiers.Count != 0
            || syntax.ReturnType is not PredefinedTypeSyntax returnType
            || !returnType.Keyword.IsKind(SyntaxKind.VoidKeyword)
            || syntax.TypeParameterList is not null
            || syntax.ConstraintClauses.Count != 0
            || syntax.ExpressionBody is not null
            || !syntax.SemicolonToken.IsKind(SyntaxKind.None)
            || syntax.Body is null
            || syntax.Body.Statements.Count != 1)
        {
            return false;
        }

        if (!TryCanonicalIdentifier(syntax.Identifier, budget, out var name)
            || syntax.ParameterList.Parameters.Count != 2)
        {
            return false;
        }

        var parameters = new List<object>();
        for (var index = 0; index < syntax.ParameterList.Parameters.Count; index += 1)
        {
            var parameter = syntax.ParameterList.Parameters[index];
            if (parameter.AttributeLists.Count != 0
                || parameter.Modifiers.Count != 0
                || parameter.Default is not null
                || parameter.Type is not PredefinedTypeSyntax parameterType)
            {
                return false;
            }
            var type = parameterType.Keyword.ValueText;
            if (!budget.Identifier(type)
                || !TryCanonicalIdentifier(parameter.Identifier, budget, out var parameterName))
            {
                return false;
            }
            parameters.Add(new Dictionary<string, object?>
            {
                ["position"] = index + 1,
                ["name"] = parameterName,
                ["type"] = type,
            });
        }

        if (syntax.Body.Statements[0] is not ExpressionStatementSyntax expression
            || !TryInterpolatedWrite(expression, budget, out var interpolation))
        {
            return false;
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["name"] = name,
            ["return_type"] = returnType.Keyword.ValueText,
            ["parameters"] = parameters,
            ["interpolation"] = InterpolationObject(interpolation),
        };
        return true;
    }

    private static bool TryArray(
        LocalDeclarationStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (!PlainLocalDeclaration(syntax)
            || syntax.Declaration.Type is not ArrayTypeSyntax arrayType
            || arrayType.ElementType is not PredefinedTypeSyntax elementType
            || !elementType.Keyword.IsKind(SyntaxKind.StringKeyword)
            || arrayType.RankSpecifiers.Count != 1
            || arrayType.RankSpecifiers[0].Sizes.Count != 1
            || arrayType.RankSpecifiers[0].Sizes[0] is not OmittedArraySizeExpressionSyntax
            || syntax.Declaration.Variables.Count != 1)
        {
            return false;
        }

        var variable = syntax.Declaration.Variables[0];
        if (variable.ArgumentList is not null
            || variable.Initializer?.Value is not InitializerExpressionSyntax initializer
            || !initializer.IsKind(SyntaxKind.ArrayInitializerExpression))
        {
            return false;
        }

        if (!TryCanonicalIdentifier(variable.Identifier, budget, out var target)
            || initializer.Expressions.Count > FieldLimit)
        {
            return false;
        }
        var values = new List<string>();
        foreach (var expression in initializer.Expressions)
        {
            if (!TryStringLiteral(expression, budget, out var value))
            {
                return false;
            }
            values.Add(value);
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["target"] = target,
            ["element_type"] = elementType.Keyword.ValueText,
            ["values"] = values,
        };
        return true;
    }

    private static bool TryInput(
        LocalDeclarationStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (!PlainLocalDeclaration(syntax)
            || syntax.Declaration.Type is not PredefinedTypeSyntax typeSyntax
            || syntax.Declaration.Variables.Count != 1)
        {
            return false;
        }

        var variable = syntax.Declaration.Variables[0];
        if (variable.ArgumentList is not null || variable.Initializer is null)
        {
            return false;
        }
        var type = typeSyntax.Keyword.ValueText;
        if (!budget.Identifier(type)
            || !TryCanonicalIdentifier(variable.Identifier, budget, out var target))
        {
            return false;
        }

        string kind;
        string fallback;
        if (typeSyntax.Keyword.IsKind(SyntaxKind.StringKeyword)
            && TryReadLineCoalesce(variable.Initializer.Value, budget, out fallback))
        {
            kind = "read_line_coalesce_string";
        }
        else if (typeSyntax.Keyword.IsKind(SyntaxKind.IntKeyword)
            && variable.Initializer.Value is InvocationExpressionSyntax parseInvocation
            && IsIntParse(parseInvocation.Expression)
            && TrySingleArgument(parseInvocation.ArgumentList, out var parseArgument)
            && TryReadLineCoalesce(parseArgument.Expression, budget, out fallback))
        {
            kind = "int_parse_read_line_coalesce_string";
        }
        else
        {
            return false;
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["target"] = target,
            ["kind"] = kind,
            ["fallback"] = fallback,
        };
        return true;
    }

    private static bool TryLiteralWrite(
        ExpressionStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (syntax.AttributeLists.Count != 0
            || syntax.Expression is not InvocationExpressionSyntax invocation
            || !IsConsoleMember(invocation.Expression, "WriteLine")
            || !TrySingleArgument(invocation.ArgumentList, out var argument)
            || !TryStringLiteral(argument.Expression, budget, out var text))
        {
            return false;
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["text"] = text,
        };
        return true;
    }

    private static bool TryConditional(
        IfStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (syntax.Condition is not BinaryExpressionSyntax condition
            || !condition.IsKind(SyntaxKind.GreaterThanOrEqualExpression)
            || condition.Left is not IdentifierNameSyntax leftSyntax
            || !TryCanonicalInteger(condition.Right, out var right)
            || syntax.Statement is not BlockSyntax trueBlock
            || trueBlock.Statements.Count != 1
            || trueBlock.Statements[0] is not ExpressionStatementSyntax trueStatement
            || syntax.Else?.Statement is not BlockSyntax falseBlock
            || falseBlock.Statements.Count != 1
            || falseBlock.Statements[0] is not ExpressionStatementSyntax falseStatement
            || !TryLiteralWrite(trueStatement, 1, 1, budget, out var trueFact)
            || !TryLiteralWrite(falseStatement, 1, 1, budget, out var falseFact))
        {
            return false;
        }

        if (!TryCanonicalIdentifier(leftSyntax.Identifier, budget, out var left))
        {
            return false;
        }
        var whenTrue = (string)((Dictionary<string, object?>)trueFact)["text"]!;
        var whenFalse = (string)((Dictionary<string, object?>)falseFact)["text"]!;
        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["left"] = left,
            ["operator"] = ">=",
            ["right"] = right,
            ["when_true"] = whenTrue,
            ["when_false"] = whenFalse,
        };
        return true;
    }

    private static bool TryForeach(
        ForEachStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (!syntax.AwaitKeyword.IsKind(SyntaxKind.None)
            || syntax.Type is not PredefinedTypeSyntax elementTypeSyntax
            || !elementTypeSyntax.Keyword.IsKind(SyntaxKind.StringKeyword)
            || syntax.Expression is not IdentifierNameSyntax collectionSyntax
            || syntax.Statement is not BlockSyntax block
            || block.Statements.Count != 1
            || block.Statements[0] is not ExpressionStatementSyntax write
            || !TryInterpolatedWrite(write, budget, out var interpolation))
        {
            return false;
        }

        var elementType = elementTypeSyntax.Keyword.ValueText;
        if (!budget.Identifier(elementType)
            || !TryCanonicalIdentifier(syntax.Identifier, budget, out var target)
            || !TryCanonicalIdentifier(collectionSyntax.Identifier, budget, out var collection))
        {
            return false;
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["element_type"] = elementType,
            ["target"] = target,
            ["collection"] = collection,
            ["interpolation"] = InterpolationObject(interpolation),
        };
        return true;
    }

    private static bool TryDirectCall(
        ExpressionStatementSyntax syntax,
        int statement,
        int occurrence,
        Budget budget,
        out object fact)
    {
        fact = new object();
        if (syntax.AttributeLists.Count != 0
            || syntax.Expression is not InvocationExpressionSyntax invocation
            || invocation.Expression is not IdentifierNameSyntax targetSyntax
            || invocation.ArgumentList.Arguments.Count > FieldLimit)
        {
            return false;
        }
        if (!TryCanonicalIdentifier(targetSyntax.Identifier, budget, out var target))
        {
            return false;
        }
        var arguments = new List<string>();
        foreach (var argument in invocation.ArgumentList.Arguments)
        {
            if (argument.NameColon is not null
                || !argument.RefKindKeyword.IsKind(SyntaxKind.None)
                || argument.Expression is not IdentifierNameSyntax identifier)
            {
                return false;
            }
            if (!TryCanonicalIdentifier(identifier.Identifier, budget, out var name))
            {
                return false;
            }
            arguments.Add(name);
        }

        fact = new Dictionary<string, object?>
        {
            ["occurrence"] = occurrence,
            ["statement"] = statement,
            ["target"] = target,
            ["arguments"] = arguments,
        };
        return true;
    }

    private static bool TryInterpolatedWrite(
        ExpressionStatementSyntax syntax,
        Budget budget,
        out InterpolationFact interpolation)
    {
        interpolation = new InterpolationFact(new List<string>(), new List<string>());
        if (syntax.AttributeLists.Count != 0
            || syntax.Expression is not InvocationExpressionSyntax invocation
            || !IsConsoleMember(invocation.Expression, "WriteLine")
            || !TrySingleArgument(invocation.ArgumentList, out var argument)
            || argument.Expression is not InterpolatedStringExpressionSyntax interpolated
            || !interpolated.StringStartToken.IsKind(SyntaxKind.InterpolatedStringStartToken)
            || interpolated.StringStartToken.Text != "$\""
            || interpolated.StringEndToken.Text != "\"")
        {
            return false;
        }

        var parts = new List<string> { string.Empty };
        var fields = new List<string>();
        foreach (var content in interpolated.Contents)
        {
            if (content is InterpolatedStringTextSyntax text)
            {
                var value = text.TextToken.ValueText;
                var combined = parts[^1] + value;
                if (text.TextToken.Text != value
                    || !IsCanonicalPlainText(value)
                    || !budget.Text(value)
                    || combined.Length > TextLimit)
                {
                    return false;
                }
                parts[^1] = combined;
                continue;
            }
            if (content is not InterpolationSyntax field
                || field.AlignmentClause is not null
                || field.FormatClause is not null
                || field.Expression is not IdentifierNameSyntax identifier
                || fields.Count >= FieldLimit)
            {
                return false;
            }
            if (!TryCanonicalIdentifier(identifier.Identifier, budget, out var fieldName))
            {
                return false;
            }
            fields.Add(fieldName);
            parts.Add(string.Empty);
        }
        if (parts.Count != fields.Count + 1)
        {
            return false;
        }
        interpolation = new InterpolationFact(parts, fields);
        return true;
    }

    private static bool TryReadLineCoalesce(ExpressionSyntax syntax, Budget budget, out string fallback)
    {
        fallback = string.Empty;
        if (syntax is not BinaryExpressionSyntax coalesce
            || !coalesce.IsKind(SyntaxKind.CoalesceExpression)
            || coalesce.Left is not InvocationExpressionSyntax readLine
            || !IsConsoleMember(readLine.Expression, "ReadLine")
            || readLine.ArgumentList.Arguments.Count != 0
            || !TryStringLiteral(coalesce.Right, budget, out fallback))
        {
            return false;
        }
        return true;
    }

    private static bool TryStringLiteral(ExpressionSyntax syntax, Budget budget, out string value)
    {
        value = string.Empty;
        if (syntax is not LiteralExpressionSyntax literal
            || !literal.IsKind(SyntaxKind.StringLiteralExpression)
            || literal.Token.Value is not string text
            || !literal.Token.IsKind(SyntaxKind.StringLiteralToken)
            || literal.Token.Text != $"\"{text}\""
            || !IsCanonicalPlainText(text)
            || !budget.Text(text))
        {
            return false;
        }
        value = text;
        return true;
    }

    private static bool TryCanonicalInteger(ExpressionSyntax syntax, out int value)
    {
        value = 0;
        if (syntax is not LiteralExpressionSyntax literal
            || !literal.IsKind(SyntaxKind.NumericLiteralExpression)
            || literal.Token.Value is not int integer
            || integer < 0)
        {
            return false;
        }
        var text = literal.Token.Text;
        if (text != integer.ToString(System.Globalization.CultureInfo.InvariantCulture))
        {
            return false;
        }
        value = integer;
        return true;
    }

    private static bool PlainLocalDeclaration(LocalDeclarationStatementSyntax syntax)
    {
        return syntax.AttributeLists.Count == 0
            && syntax.Modifiers.Count == 0
            && syntax.UsingKeyword.IsKind(SyntaxKind.None)
            && syntax.AwaitKeyword.IsKind(SyntaxKind.None);
    }

    private static bool IsConsoleMember(ExpressionSyntax syntax, string memberName)
    {
        return syntax is MemberAccessExpressionSyntax member
            && member.IsKind(SyntaxKind.SimpleMemberAccessExpression)
            && member.Expression is IdentifierNameSyntax receiver
            && IsCanonicalIdentifier(receiver.Identifier, "Console")
            && member.Name is IdentifierNameSyntax name
            && IsCanonicalIdentifier(name.Identifier, memberName);
    }

    private static bool IsIntParse(ExpressionSyntax syntax)
    {
        return syntax is MemberAccessExpressionSyntax member
            && member.IsKind(SyntaxKind.SimpleMemberAccessExpression)
            && member.Expression is PredefinedTypeSyntax receiver
            && receiver.Keyword.IsKind(SyntaxKind.IntKeyword)
            && member.Name is IdentifierNameSyntax name
            && IsCanonicalIdentifier(name.Identifier, "Parse");
    }

    private static bool TryCanonicalIdentifier(SyntaxToken token, Budget budget, out string value)
    {
        value = token.ValueText;
        return token.Text == value && budget.Identifier(value);
    }

    private static bool IsCanonicalIdentifier(SyntaxToken token, string expected)
    {
        return token.Text == expected && token.ValueText == expected;
    }

    private static bool IsCanonicalPlainText(string value)
    {
        foreach (var character in value)
        {
            if (character is < ' ' or > '~' or '\"' or '\\')
            {
                return false;
            }
        }
        return true;
    }

    private static bool TrySingleArgument(ArgumentListSyntax arguments, out ArgumentSyntax argument)
    {
        argument = null!;
        if (arguments.Arguments.Count != 1)
        {
            return false;
        }
        argument = arguments.Arguments[0];
        return argument.NameColon is null && argument.RefKindKeyword.IsKind(SyntaxKind.None);
    }

    private static Dictionary<string, object?> InterpolationObject(InterpolationFact interpolation)
    {
        return new Dictionary<string, object?>
        {
            ["parts"] = interpolation.Parts,
            ["fields"] = interpolation.Fields,
        };
    }

    private static Dictionary<string, object?> Failed(bool analyzed, bool parsed)
    {
        return new Dictionary<string, object?>
        {
            ["version"] = 1,
            ["analyzed"] = analyzed,
            ["parsed"] = parsed,
            ["straight_line"] = false,
            ["usings"] = Array.Empty<string>(),
            ["local_functions"] = Array.Empty<object>(),
            ["arrays"] = Array.Empty<object>(),
            ["inputs"] = Array.Empty<object>(),
            ["writes"] = Array.Empty<object>(),
            ["conditionals"] = Array.Empty<object>(),
            ["foreach_loops"] = Array.Empty<object>(),
            ["calls"] = Array.Empty<object>(),
        };
    }
}
