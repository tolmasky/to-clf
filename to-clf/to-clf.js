const { spawnSync: spawn } = require("child_process");

const fail = name => { throw Error(name) };
const isCLI = Symbol("isCLI");
const getOptionsParameter = ([parameter]) =>
    !parameter ? false :
    parameter.type === "ObjectPattern" ? parameter :
    parameter.type === "AssignmentPattern" ? parameter.left :
    false;

const { isArray } = Array;
const { slice } = Array.prototype;


module.exports = function (f)
{
    if (require.main && callsite() !== require.main.filename)
        return f;

    // Just do this unconditionally in case it changes...
    spawn("npm", ["install", `--prefix=${__dirname}`]);

    const pkgpath = findOwningPackagePath(require.main.filename);

    spawn("npm", ["install", `--prefix=${pkgpath}`]);

    const { Command, Argument } = require("commander");
    const { parseExpression } = require("@babel/parser");

    const fExpression = parseExpression(f + "");
    const optionsParameter = getOptionsParameter(fExpression.params);
    const hasOptionsParameter = !!optionsParameter;
    const properties = hasOptionsParameter ? optionsParameter.properties : [];
    const positionalArgumentsName = fExpression
        .params[hasOptionsParameter ? 1 : 0]

    const { argv } = process;
    const adjustedArguments = !hasOptionsParameter && argv[2] !== "--" ?
        [argv[0], argv[1], "--", ...argv.slice(2)] :
        argv;

    return properties
        .map(toParameter)
        .filter(parameter => !!parameter)
        .reduce((program, { name, isBoolean, description }) =>
            program.option(
            [
                `-${name.charAt(0)},`,
                `--${name}`,
                isBoolean ? "" : `[${name}]`
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

            const argumentsWithOptions =
                hasOptionsParameter ?
                    [{ [isCLI]: true, ...parsed[count - 2] }, ...args] :
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

const toDescription =
    ({ trailingComments }) =>
        trailingComments && trailingComments[0].value.trim();

const toPositionalArgument = Argument => node =>
    node.type === "Identifier" ?
        new Argument(node.name, toDescription(node)) :
    node.type === "RestElement" &&
    node.argument.type === "Identifier" ?
        new Argument(`...${node.argument.name}`, toDescription(node)) :
    false

const toUsage = ({ leadingComments }) =>
    leadingComments && leadingComments[0].value.trim() || "";

const toParameter = (function ()
{
    const toFlagName = ({ key }) =>
        key.name.replace(/[A-Z]/g, ch => `-${ch.toLowerCase()}`);

    return function toParameter(node)
    {
        return !node.computed &&
        {
            name: toFlagName(node),
            description: toDescription(node),
            isBoolean:
                node.value.type === "AssignmentPattern" &&
                node.value.right.type === "BooleanLiteral"
        };
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

const findOwningPackagePath = (function ()
{
    const { existsSync: exists } = require("fs");
    const { dirname, join } = require("path");

    return function findOwningPackagePath(filename, original = filename)
    {
        if (filename === "/")
            throw Error(`No owning package.json found for "${original}"`);

        const pkgpath = join(dirname(filename), "package.json");

        return exists(pkgpath) ?
            dirname(pkgpath) :
            findOwningPackagePath(dirname(filename));
    }
})();
