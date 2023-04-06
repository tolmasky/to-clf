const { type, string, forall } = require("@algebraic/type");


const Parameter = type `Parameter` .forall (T =>
({
    name        :of => string,
    flag        :of => Parameter.Flag,
    description :of => string,
//    fallback    :of => T
}));

module.exports = Parameter;

Parameter.Flag = type `Parameter.Flag`
({
    short       :of => string,
    long        :of => string
});
