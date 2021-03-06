# Command Line Functions

**Command Line Functions** are existing JavaScript functions that can be called
directly from the command line without the need to manually write a wrapper CLI
utility.


The easiest way to do this is to pass an existing JavaScript file that exports a
function to the `clf` command line utility. `clf` will **analyze the function
signature of the exported function and automatically generate the corresponding
flags and options that you can then pass in through the command line.**

For example, say you've already written a function called `deploy` in
`deploy.js`:

```javascript
module.exports = async function deploy
({
    dryRun = false /* Just print what this will do */,
    regions = [] /* Which regions to deploy to */,
},  environment /* qa, staging, or production */ )
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
}
```

You can treat this function a CLI utility by just calling `clf` like so:

```console
$ clf deploy.js qa --region aws-west-2
Deploying to qa to aws-west-2!
```

Not only that, but the comments will be appropriately interpreted for the
`--help` command:

```console
$ clf deploy.js --help
Usage: deploy [options] <environment>

Arguments:
  environment               qa, staging, or production

Options:
  -d, --dry-run             Just print what this will do
  -r, --region <region...>  Which regions to deploy to
  -h, --help                display help for command
```

Notice that `clf` automatically inferred the types of the command line options
from the actual function definition. It knows `dryRun` is a boolean from the
default parameter, and turned `regions` function option into the singular
`region` command line parameter that can be passed in multiple times, since it
noticed it was an array.

If you are writing a new function from scratch, you can choose to manually wrap
it in a call to `toCLF` yourself, so that it can always be used *both* as a
function in a larger program, or called directly as a CLI app just using node:

```javascript
const toCLF = require("to-clf");

module.exports = toCLF(async function deploy
({
    dryRun = false /* Just print what this will do. */,
    regions = [] /* Which regions to deploy to. */,
},  environment /* qa, staging, or production */ )
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
});
```

This will work identically to our first function, except you can now call it
directly using `node` instead of `clf`, as if you had wanted it to be a CLI
app from the beginning, and again still without sacrificing its usage as an
importable normal function in the rest of your program:

```bash
$ node deploy.js qa --region aws-west-2
```

This actually makes  `to-clf` one of the easiest ways to write CLI apps in node!

### How Does this Work?

`to-clf` analyzes the AST of the function in question to build a CLI options and
arguments parser. Here are the details:


```javascript
const toCLF = require("to-clf");

// toCLF will automatically interpret the destructured arguments of your
// function as CLI options.
module.exports = toCLF(function deploy
({
    // toCLF will automatically detect the CLI option type based on the default
    // parameter. For example, it knows the following option is a boolean:
    dryRun = false /* This comment automatically becomes the help description. */,

    // toCLF turns arrays into options you can pass multiple times
    regions = [] /* Regions to deploy to. */,

    // Unnamed arguments are also supported. If you leave out a default parameter,
    // the option or argument becomes required.
},  environment /* qa, staging, or production */)
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
});
```

### Installing to-clf

[`to-clf` is available on npm](https://npmjs.com/to-clf).

To use the `clf` command line utility, install it globally:

```bash
$ npm install to-clf --location=global
```

To use the `toCLF` function, install it locally:

```bash
$ npm install to-clf
```
