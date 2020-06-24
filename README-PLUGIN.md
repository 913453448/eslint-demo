## 开始

前面已经写了两篇关于eslint的文章了，想必都对eslint应该有一个简单的认识了，在平常的项目中使用应该是问题不大，面试应该也是问题不大的，大家有兴趣可以看看前面两篇文章：

- [前端框架系列之（eslint入门）](https://vvbug.blog.csdn.net/article/details/106910213)
- [前端框架系列之（eslint源码解析）](https://vvbug.blog.csdn.net/article/details/106928901)

接下来我们更深入的了解一下eslint，我们直接结合demo创建一个我们自己的plugin。

我们还是用前面我们的eslint-demo项目，代码已经上传[github](https://github.com/913453448/eslint-demo.git)了大家可以直接clone一份,我们在eslint-demo项目根目录直接创建一个plugins目录，然后创建一个.eslintrc.json文件，

.eslintrc.json：

```json
{
  "root": true
}
```

为了不跟根目录的配置文件冲突，我们直接加上了“root”：true的标识。

## env

env前面文章有介绍过，我就不在这里介绍了，比如我们有一个叫“fox”的运行环境，然后有一个“fox”的全局变量，还记得我们之前demo的做法吗？我们直接在config的globals变量中定义了一个叫fox的变量，这样我们的eslint就能识别fox变量了，

```json
{
  ...
   "globals": {
    "fox": "readonly"
  },
  ...
}
```

这一次我们通过自定义env把它当成一个fox环境，让它变成下面这样的效果：

```json
{
  "env":{
    "@fox/fox":true
  }
}
```

首先我们在plugins目录创建一个fox-plugin目录，然后在fox-plugin目录执行npm init：

```
cd ./plugins/fox-plugin && npm init
```

让fox-plugin的入口指向index.js，

package.json：

```json
{
  "name": "@fox/eslint-plugin",
  "version": "1.0.0",
  "description": "自定义eslint插件",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}

```

可以看到，我们创建了一个带@fox命名空间的插件，然后我们在fox-plugin目录创建一个入口文件index.js，

index.js:

```js
module.exports = {
    environments: {
        fox: require("./env/fox")
    }
};
```

可以看到，我们直接导出了一个对象，然后里面包含environments字段，environments对象中又包含一个fox属性，fox属性就是我们的自定义fox运行环境，我们在目录底下创建一个env目录，然后在env目录创建一个fox.js文件，

plugins/fox-plugin/env/fox.js：

```js
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
```

可以看到，我们在上面代码中合并了eslint中的原始es2020跟browser环境变量，然后还自定义了一个全局fox变量，并且设置es的语法版本为11，也就是说我们的fox环境=（es2020+browser+自定义fox）。

ok，我们已经定义完plugin了，然后也定义好了我们的env，那么项目中该怎么使用呢？

首先我们直接在我们根目录执行npm install把我们的插件引入进来：

```js
npm install -D xxx/eslint-demo/plugins/fox-plugin //注意xxx是你本地的绝对路径

```

执行完毕后我们会在根目录的node-modules目录下面找到我们的插件：

![](/Users/ocj1/WebstormProjects/Study/eslint-demo/目录1.png)

然后在配置文件中引入我们的插件和环境

plugins/.eslintrc.json：

```json
{
  "root": true,
  "env": {
    "@fox/fox": true
  },
  "plugins": [
    "@fox"
  ],
  "extends": [
    "eslint:recommended"
  ]
}
```

同时为了看效果，我们加入了eslint的recommended规则。

接下来我们创建一个测试文件来测试一下，我们在plugins的src目录中创建一个demo1.js文件，

demo1.js：

```js
document.write("hello plugin");
fox.say("hello world");
```

然后我们在根目录执行一下eslint命令：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/*                                                      
➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，没有任何报错，那我们把我们的fox环境去掉试试，

plugins/.eslintrc.json：

```js
{
  "root": true,
  "env": {
  },
  "plugins": [
    "@fox"
  ],
  "extends": [
    "eslint:recommended"
  ]
}
```

再次运行：

```js
xxx/Study/eslint-demo/plugins/src/demo1.js
  1:1  error  'document' is not defined  no-undef
  2:1  error  'fox' is not defined       no-undef

✖ 2 problems (2 errors, 0 warnings)

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，eslint直接报错了，说“document”跟“fox”变量找不到。

## processors

前面有介绍过processors，关于eslint的基础配置跟源码部分我们这一节不说明了，小伙伴可以去看前面的两篇文章，

比如我们现在有一个.fox后缀的文件，然后我们通过自定义processors来预解析文件,我们直接copy一个demo1.js文件取名字叫demo-processors.fox，

plugins/src/demo-processors.fox：

```js
document.write("hello plugin");
fox.say("hello world");
```

首先我们在fox-plugin目录创建一个processors目录，然后在processors目录中创建一个fox.js文件

plugins/fox-plugin/processors/fox.js：

```js
module.exports = {
    preprocess: function (text, filename) {
        text = text.replace(/plugin/g, "yasin");
        console.log("text", text);
        return [text];  // return an array of strings to lint
    },
    postprocess: function (messages, filename) {
        const problems = messages[0];
        return problems.map((problem) => {
            return {
                ...problem,
                message: problem.message+"(found by Yasin!)"
            };
        });
    },

    supportsAutofix: true // (optional, defaults to false)
};
```

我们直接导入了一个对象，然后里面包含了preprocess跟postprocess方法，在preprocess方法中，我直接字符串替换掉了“plugin”为“yasin”，然后返回一个数组，数组里面包含的是需要eslint校验的代码块，在postprocess方法中我们对eslint处理过后的message做一次封装，把所有的message都带有一个“(found by Yasin!)”的说明。

接下来我们在插件的清单文件中导出这个processor，

plugins/fox-plugin/index.js：

```js
module.exports = {
    environments: {
        fox: require("./env/fox")
    },
    processors: {
        ".fox": require("./processors/fox")
    }
};
```

可以看到，我们声明了一个“processors”字段，然后在processors中声明了一个".fox"字段指向我们自定义的processor，

注意：“.fox”是你要作用的文件的后缀，也就是说我们的processor只会作用我们的“.fox”后缀文件。

在插件中导出processors后是不需要在配置文件中申明的，eslint会根据插件自动找到".fox"的processor。

plugins/.eslintrc.json：

```js
{
  "root": true,
  "env": {
    "@fox/fox": true
  },
  "plugins": [
    "@fox"
  ],
  "extends": [
    "eslint:recommended"
  ],
  "rules": {
    "semi": ["error","always"]
  }
}
```

在根目录运行eslint：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/*
text document.write("hello yasin");
fox.say("hello world");
➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，打印我们的demo-processors.fox文件中的内容，并且替换了字符串“eslint”为“yasin”，然后没有报错，我们试着修改下代码让它报错，我们直接去掉一个分号“;”,

plugins/src/demo-processors.fox:

```js
document.write("hello plugin");
fox.say("hello world")
```

再次运行eslint：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/*
text document.write("hello yasin");
fox.say("hello world")

xxxx/eslint-demo/plugins/src/demo-processors.fox
  2:23  error  Missing semicolon.(found by Yasin!)  semi

✖ 1 problem (1 error, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，我们的报错信息出来了，并且加上了我们在processor自定义的内容“(found by Yasin!) ”。

## rules

自定义rule算是我们插件中最重要也是最复杂的模块了，这意味着我们需要去操作ast对象了，操作ast对象还是有一定难度的，因为你需要对ast有比较深入的了解，这就需要我们去查看一些parser的源码了，废话不多说，我们直接开干！

开始之前我们得先有一个需求，我们直接copy一份demo-processors.fox然后命名为demo-rule.js，

demo-rule.js：

```js
document.write("hello plugin");
fox.say("hello world");
```

我们的需求就是把“hello plugin” 改成“hello yasin”，好啦！ 有需求后我们直接开撸。

我们先看一下rule中必须要有的一些信息：

`meta`（对象）包含规则的元数据：

- type(string) 指示规则的类型，值为"problem""suggestion"或"layout"

  - `"problem"` 指的是该规则识别的代码要么会导致错误，要么可能会导致令人困惑的行为。开发人员应该优先考虑解决这个问题。
  - `"suggestion"` 意味着规则确定了一些可以用更好的方法来完成的事情，但是如果代码没有更改，就不会发生错误。
  - `"layout"` 意味着规则主要关心空格、分号、逗号和括号，以及程序中决定代码外观而不是执行方式的所有部分。这些规则适用于AST中没有指定的代码部分。

- docs

   (object) 对 ESLint 核心规则来说是必需的:

  - `description` (字符串) 提供规则的简短描述在[规则首页](http://eslint.cn/docs/rules/)展示
  - `category` (string) 指定规则在[规则首页](http://eslint.cn/docs/rules/)处于的分类
  - `recommended` (boolean) [配置文件](http://eslint.cn/docs/user-guide/configuring#extending-configuration-files)中的 `"extends": "eslint:recommended"`属性是否启用该规则
  - `url` (string) 指定可以访问完整文档的 url。

  在自定义的规则或插件中，你可以省略 `docs` 或包含你需要的任何属性。

- **`fixable`重要：**如果没有 `fixable` 属性，即使规则实现了 `fix` 功能，ESLint 也不会[进行修复](http://eslint.cn/docs/developer-guide/working-with-rules#applying-fixes)。如果规则不是可修复的，就省略 `fixable` 属性。

  源码中有说明

  lib/linter/linter.js:

  ```js
  if (problem.fix && rule.meta && !rule.meta.fixable) {
     throw new Error("Fixable rules should export a `meta.fixable` property.");
  }
  lintingProblems.push(problem);
  ```

  fixable只需要有值就可以了，具体有啥含义我也不是很清楚哈，不过看官方一般都是以下这几个值“true”、"whitespace" 、"code"。

- `schema` (array) 指定该[选项](http://eslint.cn/docs/developer-guide/working-with-rules#options-schemas) 这样的 ESLint 可以避免无效的[规则配置](http://eslint.cn/docs/user-guide/configuring#configuring-rules#configuring-rules)

- `deprecated` (boolean) 表明规则是已被弃用。如果规则尚未被弃用，你可以省略 `deprecated` 属性。

- `replacedBy` (array) 在不支持规则的情况下，指定替换的规则

`create` (function) 返回一个对象，其中包含了 ESLint 在遍历 JavaScript 代码的抽象语法树 AST ([ESTree](https://github.com/estree/estree) 定义的 AST) 时，用来访问节点的方法。



因为要操作ast对象了，我们先看一下我们的demo-rule.js转换成ast后是什么样子的:

```js
{
  "type": "Program",
  "start": 0,
  "end": 31,
  "range": [
    0,
    31
  ],
  "body": [
    {
      "type": "ExpressionStatement",
      "start": 0,
      "end": 31,
      "range": [
        0,
        31
      ],
      "expression": {
        "type": "CallExpression",
        "start": 0,
        "end": 30,
        "range": [
          0,
          30
        ],
        "callee": {
          "type": "MemberExpression",
          "start": 0,
          "end": 14,
          "range": [
            0,
            14
          ],
          "object": {
            "type": "Identifier",
            "start": 0,
            "end": 8,
            "range": [
              0,
              8
            ],
            "name": "document"
          },
          "property": {
            "type": "Identifier",
            "start": 9,
            "end": 14,
            "range": [
              9,
              14
            ],
            "name": "write"
          },
          "computed": false
        },
        "arguments": [
          {
            "type": "Literal",
            "start": 15,
            "end": 29,
            "range": [
              15,
              29
            ],
            "value": "hello plugin",
            "raw": "\"hello plugin\""
          }
        ]
      }
    }
  ],
  "sourceType": "module"
}
```

所以我们只需要监听“Literal”类型的节点，然后修改掉当前节点的value值就可以了，

我们在eslint-demo目录创建一个rules目录，然后里面创建一个plugin2yasin.js文件，

plugin2yasin.js：

```js
module.exports = {
    meta: {
        type: "layout",
        docs: {
            description: "使用自定义的字符串或者'yasin'替换'plugin'",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://xxx.com.cn"
        },
        fixable: "code",
        schema: [
            {
                type: "string",
            }
        ],
        messages: {
            errorStr: "错误的字符串'plugin'"
        }
    },
    create(context){
      //获取规则中配置的第一个参数，默认为“yasin”
        const msg = context.options[0] || "yasin";

        function checkLiteral(node) {
            let fix, messageId;
            //如果当前节点的value里面包含plugin字符串的话就进行校验
            if (node.value.indexOf("plugin") !== -1) {
                //设置messageId为我们meta中的"errorStr"类型
                messageId = "errorStr";
                //告诉eslint该怎么修复代码
                fix = (fixer) => {
                    return {
                        range: node.range, //节点在代码中的的范围
                        text: `"${node.value.replace(/(\w)*(plugin)/g, `$1${msg}`)}"` //当前节点的源码内容
                    };
                };
                //报告eslint错误信息
                context.report({
                    node,
                    messageId,
                    fix,
                });
            }
        }

        return {
            Literal: checkLiteral //监听ast的Literal节点
        };
    }
};
```

好啦，我们的rule定义完毕了，然后我们在plugin的清单文件中导出这个规则，

plugins/fox-plugin/index.js：

```js
module.exports = {
    environments: {
        fox: require("./env/fox")
    },
    processors: {
        ".fox": require("./processors/fox")
    },
    rules: {
        "plugin2yasin": require("./rules/plugin2yasin")
    }
};
```

然后我们在我们的配置文件中使用一下我们的规则，

plugins/.eslintrc.json：

```json
{
  "root": true,
  "env": {
    "@fox/fox": true
  },
  "plugins": [
    "@fox"
  ],
  "extends": [
    "eslint:recommended"
  ],
  "rules": {
    "semi": ["error","always"],
    "@fox/plugin2yasin": ["error","你好呀"]
  }
}
```

可以看到，我们配置了一个"@fox/plugin2yasin": ["error","你好呀"]规则，然后传递了一个“你好呀”参数给我们的自定义规则。

我们在根目录运行我们的eslint：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/*
text document.write("hello yasin");
fox.say("hello world");

xxx/eslint-demo/plugins/src/demo-rule.js
  1:16  error  错误的字符串'plugin'  @fox/plugin2yasin

xxx/eslint-demo/plugins/src/demo1.js
  1:16  error  错误的字符串'plugin'     @fox/plugin2yasin
  1:31  error  Missing semicolon  semi

✖ 3 problems (3 errors, 0 warnings)
  3 errors and 0 warnings potentially fixable with the `--fix` option.

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，有三处地方报错了，我们一个个看一下对不对

xxx/eslint-demo/plugins/src/demo-rule.js：

```js
document.write("hello plugin"); //1:16  error  错误的字符串'plugin'  @fox/plugin2yasin
fox.say("hello world");
```

xxx/eslint-demo/plugins/src/demo1.js:

```js
document.write("hello plugin")
fox.say("hello world");
// 1:16  error  错误的字符串'plugin'     @fox/plugin2yasin
// 1:31  error  Missing semicolon  semi
```

我们可以确定，我们的自定义规则生效了，而且位置都是正确的，

接下来我们测试一个我们自定义rule的fix功能

我们在根目录运行我们的eslint：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/* --fix
text document.write("hello yasin");
fox.say("hello world");
➜  eslint-demo git:(v0.0.1) ✗ 
```

可以看到，我们在结尾加了一个--fix选项，然后终端中没有任何报错，我们直接打开我们的demo-rule.js文件看看eslint有没有帮我们修改掉代码，

plugins/src/demo-rule.js

```js
document.write("hello 你好呀");
fox.say("hello world");
```

可以看到，eslint已经帮我们把“plugin”修改成了“你好呀”字符串了。

### Configs

你可以在一个插件中在 `configs` 键下指定打包的配置。当你想提供不止代码风格，而且希望提供一些自定义规则来支持它时，会非常有用。每个插件支持多配置。注意不可能为给定的插件指定默认配置，当用户想要使用一个插件时，必须在配置文件中指定。

当我们用eslint原生、vue、react、typescript等第三方插件的时候，我们都会用到extends属性，每个插件都有个“recommended”或者其它的config让我们继承，比如eslint-plugin-vue的清单文件，里面有这些config

xxx/node_modules/eslint-plugin-vue/lib/index.js

```js
{
  configs: {
    'base': require('./configs/base'),
    'essential': require('./configs/essential'),
    'no-layout-rules': require('./configs/no-layout-rules'),
    'recommended': require('./configs/recommended'),
    'strongly-recommended': require('./configs/strongly-recommended')
  }
}
```

然后我们config用的时候就可以这样了：

```js
{
  "plugins":[
    "vue"
  ],
  "extends":[
    "vue/recommended"
  ] 
}
```

这样就可以把vue的recommended给继承过来了，所以我们也在我们的fox插件中创建一个recommended配置信息。

首先我们在fox-plugin目录底下创建一个configs目录，然后在configs目录下面创建一个recommended.js文件，

recommended.js：

```js
module.exports = {
    "env": {
        "@fox/fox": true
    },
    "plugins": [
        "@fox"
    ],
    "extends": [
        "eslint:recommended"
    ],
    "rules": {
        "semi": ["error","always"],
        "@fox/plugin2yasin": ["error","你好呀"]
    }
};

```

可以看到我们直接把.eslintrc.json内容直接copy过来了，然后我们在插件的清单文件中导出config，

plugins/fox-plugin/index.js：

```js
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
```

然后我们修改一下我们的.eslintrc.json文件，让它直接继承我们的@fox/recommended配置，

plugins/.eslintrc.json：

```json
{
  "root": true,
  "plugins": [
    "@fox"
  ],
  "extends": [
    "plugin:@fox/recommended"
  ]
}
```

然后运行我们的eslint：

```js
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./plugins/src/*
text document.write("hello yasin");
fox.say("hello world");

xxx/eslint-demo/plugins/src/demo-rule.js
  1:16  error  错误的字符串'plugin'  @fox/plugin2yasin

✖ 1 problem (1 error, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，跟我们之前效果都是一样的，是的！ config也就是让你的eslint的配置文件少写一写配置。





ok！ eslint内容就已经全部结束了，我们从eslint的入门--->eslint的源码分析-->自定义plugin，基本上是把eslint的全部内容全部撸了一遍，不得不说，eslint还是挺牛逼的，eslint在日常开发中还是起到了不可限量的作用的，很多人一开始都是很反感这玩意的，但是对于一个团队来说，良好的代码规范能够让其他人更好的看懂你的代码的，最后，欢迎志同道合的童鞋一起学习一起交流，有啥问题都可以联系我，后面还会持续更新框架系列的文章，敬请期待！！