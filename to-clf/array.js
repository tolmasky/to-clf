require("@climb/until");
require("@algebraic/dense-int-set");

const { type, string, List } = require("@algebraic/type");
const { constructible }= require("@algebraic/type/function-define");
const Field = require("@algebraic/type/field");

const Definition = Object.getOwnPropertySymbols(type.string)[0];
const nothing = type `blah` ({ a: string });
const TypeDefinition = type.definition(nothing).constructor;

module.exports = constructible("array", function (T, ...args)
    {
        return defaultValue => Field({ type: T, defaultValue });
    }, 
    (T, property,
        TDefinition = new TypeDefinition(T, {
    name: "array",
    has: (T, value) => Array.isArray(value),
    toDefaultValue: () => []
}),
        constructors = Object.values(TDefinition.constructors)) =>
    [
        property.prototypeOf(type.prototype),
        property({ name: Definition, value: TDefinition })
    ]);