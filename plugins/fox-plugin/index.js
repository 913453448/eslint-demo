module.exports = {
    environments: {
        fox: require("./env/fox")
    },
    processors: {
        ".fox": require("./processors/fox")
    },
    rules: {
        "plugin2yasin": require("./rules/plugin2yasin")
    },
    configs: {
        'recommended': require('./configs/recommended'),
    },
};