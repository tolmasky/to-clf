const fail = name => { throw Error(name) };
const isCLI = Symbol("isCLI");
const getOptionsParameter = ([parameter]) =>
    !parameter ? false :
    parameter.type === "ObjectPattern" ? parameter :
    parameter.type === "AssignmentPattern" &&
    parameter.left.type === "ObjectPattern" ? parameter.left :
    false;
const type = require("@algebraic/type");
const array = require("./array");

const toDashCase = string =>
    string.replace(/[A-Z]/g, ch => `-${ch.toLowerCase()}`);

const Command = require("./command");
const Parameter = require("./parameter");

module.exports = function (f, argv = false)
{
    if (!argv && require.main && callsite() !== require.main.filename)
        return f;

//    const { Command, Argument } = require("commander");
    const { parseExpression } = require("@babel/parser");

    const fExpression = parseExpression(f + "");
    const optionsParameter = getOptionsParameter(fExpression.params);
    const hasOptionsParameter = !!optionsParameter;
    const properties = hasOptionsParameter ? optionsParameter.properties : [];
    const positionalArgumentsName = fExpression
        .params[hasOptionsParameter ? 1 : 0]

    const unadjustedArguments = argv || process.argv;
    const adjustedArguments =
        !hasOptionsParameter &&
        unadjustedArguments[2] !== "--" &&
        unadjustedArguments[2] !== "--help" ?
        [
            unadjustedArguments[0],
            unadjustedArguments[1],
            "--",
            ...unadjustedArguments.slice(2)
        ] :
        unadjustedArguments;
        console.log(properties);
    const command = toCommand(f, properties);
console.log(command.parameters);
    return;

        //
        //.filter(parameter => !!parameter)
        //.map(parameter => [parameter.implied, parameter]));

    return Object
        .values(parameters)
        .reduce((program, { flag, type, description }) =>
            program.option(
            [
                `-${flag.charAt(0)},`,
                `--${flag}`,
                type === "boolean" ?
                    "" :
                type === "array" ?
                    `<${flag}...>` :
                    `<${flag}>`
            ].join(" "), description),
            fExpression
                .params
                .slice(hasOptionsParameter ? 1 : 0)
                .map(toPositionalArgument(Argument))
                .filter(x => !!x)
                .reduce((program, argument) =>
                    program.addArgument(argument),
                    new Command()))
        //.usage(toUsage(fExpression))
        .action(async function (...parsed)
        {
            const count = parsed.length;
            const args = parsed[count - 1].args.slice(0);

            const argumentsWithOptions = hasOptionsParameter ?
                [{
                    [isCLI]: true,
                    ...Object.fromEntries(Object
                        .entries(parsed[count - 2])
                        .map(([key, value]) => [parameters[key].name, value]))
                }, ...args] :
                args;

            try
            {
                const result = await f(...argumentsWithOptions);

                return result !== void(0) ? console.log(result) : void(0);
            }
            catch (error)
            {
                console.error(error);
                process.exit(1);
            }
        })
        .parseAsync(adjustedArguments);
}

const toCommand = (f, properties) => Command
({
    name: f.name,
    parameters: properties
        .map(toParameter)
        .filter(parameter => !!parameter)
});

const toDescription =
    ({ trailingComments }) =>
        trailingComments && trailingComments[0].value.trim();

const toPositionalArgument = Argument => node =>
    node.type === "AssignmentPattern" ?
        new Argument(`[${node.left.name}]`, toDescription(node)) :
    node.type === "Identifier" ?
        new Argument(`<${node.name}>`, toDescription(node)) :
    node.type === "RestElement" &&
    node.argument.type === "Identifier" ?
        new Argument(`[${node.argument.name}...]`, toDescription(node)) :
    false

const toUsage = ({ leadingComments }) =>
    leadingComments && leadingComments[0].value.trim() || "";

const toParameterType = ({ value }) =>
    value.type !== "AssignmentPattern" ? type.string :
    value.right.type === "BooleanLiteral" ? type.boolean :
    value.right.type === "StringLiteral" ? type.string :
    value.right.type === "ArrayExpression" ? array :
    type.string;

const toParameter = (function ()
{
    const toSingular = string => string.replace(/s$/, "");
    const toFlag = (name, T) => Parameter.Flag
    ({
        short: name.charAt(0),
        long: (T === array ? toSingular : x => x)(toDashCase(name))
    });

    return function toParameter(node)
    {
        const name = node.key.name;
        const T = toParameterType(node);
console.log(T);
        return !node.computed && Parameter.of(T)
        ({
            name,
            flag: toFlag(name, T),
//            implied: type === "array" ? toSingular(name) : name,
            description: toDescription(node),
            type
        });
    }
})();

module.exports.isCLI = isCLI;

function callsite()
{
    const { stackTraceLimit } = Error;
    Error.stackTraceLimit = 3;
    const prepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, backtrace) => backtrace;

    const backtrace = Error().stack;

    Error.prepareStackTrace = prepareStackTrace;

    return backtrace[2].getFileName();
}
