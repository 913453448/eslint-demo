const eslintEnv = require("eslint/conf/environments"); //获取eslint的所有环境变量
module.exports = {
    globals: {
        ...eslintEnv.get("es2020").globals, //合并eslint的es2020变量
        ...eslintEnv.get("browser").globals, //合并eslint的browser变量
        ...{ //合并自定义的环境变量
            fox: false,
        }
    },
    parserOptions: {
        ecmaVersion: 11 //设置语法为es2020
    }
};