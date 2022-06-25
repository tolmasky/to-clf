# toCLF ("to command line function")

**Command Line Functions** are functions that can be called directly from the command line.

`toCLF` takes a function and automatically interprets it's parameters to generate a CLI, allowing a single function declaration to serve both as a CLI you can call directly, while still allowing you to import it and use it like a normal function in the rest of your program.

Here's how it works:

```javascript
const toCLF = require("to-clf");

// toCLF will automatically interpret the destructured arguments of your
// function as CLI options.
module.exports = toCLF(async function deploy
({
    // toCLF will automatically detect the CLI option type based on the default
    // parameter. For example, it knows the following option is a boolean:
    dryRun = false /* This comment automatically becomes the help description. */,

    // toCLF turns arrays into options you can pass multiple times
    regions = [] /* Regions to deploy to. */,

    // If you leave out a default parameter, the option becomes required.
    necessary /* Have to pass this in. */,

    // Unnamed arguments are also supported:
}, environment = "qa")
{
    console.log(`Deploying to ${environment}!`);
});
```

If you were to run this file directly, you would get the following output:

![Terminal output of example deploy function run directly as a CLI program](/to-clf/README/terminal-output.png)
