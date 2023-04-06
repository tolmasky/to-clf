const { type, string } = require("@algebraic/type");
const array = require("./array");


module.exports = type `Command`
({
    name        :of => string,
    parameters  :of => array,
    subcommands :of => array
});
