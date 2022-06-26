# toCLF ("to command line function")

**Command Line Functions** are functions that can be called directly from the
command line.

The easiest way to use `to-clf` is to just call the `clf` command line utility
by passing it an existing JavaScript file and it will run whichever function
this file exports as a CLI app, automatically analyzing its parameters and
turning them into command line parameters you can pass in.

For example, say you've already written a function called `deploy` in
`deploy.js`:

```javascript
module.exports = async function deploy
({
    dryRun = false /* Just print what this will do. */,
    regions = [] /* Which regions to deploy to. */,
}, environment /* qa, staging, or production */ )
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
}
```

You can just call it with `clf` like so:

![Terminal output of example deploy function run directly as a CLI program](/to-clf/README/terminal-output.png)

Not only that, the comments will be appropriately interpreted for the `--help` command:

![Terminal output of example deploy function --help command](/to-clf/README/terminal-output-help.png)

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
}, environment /* qa, staging, or production */ )
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

    // If you leave out a default parameter, the option becomes required.
    necessary /* Have to pass this in. */,

    // Unnamed arguments are also supported:
}, environment /* qa, staging, or production */)
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
});
```

### Installing to-clf

[`to-clf` is available on npm](https://npmjs.com/to-clf).

```bash
$ npm install to-clf
```
