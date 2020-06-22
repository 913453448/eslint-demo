## 创建工程

我们创建一个叫eslint-demo的工程，然后执行npm初始化

https://github.com/913453448/eslint-demo

```
npm init
```

## 安装使用

安装eslint

```js
$ npm install eslint --save-dev
```

## 创建配置文件

执行eslint的初始化

```js
npx eslint --init
```

执行完毕后可以看到一个配置文件，我选的是json格式的配置文件，还有package.json中直接引用、yaml、js格式的配置文件，后面我们会讲到。

### .eslintrc.json

```json
{

}

```

可以看到，我们这里是一个空的配置文件。

## 运行命令

我们创建一个叫src的目录，然后创建一个demo1.js的文件测试

demo1.js:

我们随便写点代码，比如直接document页面输出一个字符串

```js
document.write("hello eslint");
```

运行eslint测试：

```js
npx eslint ./src/demo1.js
```

运行完毕后你会发现，没有报错跟提示，这是因为我们还没有进行任何eslint的配置，下面我们就结合demo对eslint配置逐个进行解析。

为了更好的理解eslint，我们直接clone一份源码，https://github.com/eslint/eslint.git

## 配置

我们这里以一个前端vue+webpack+ts+es2020的工程为demo为例子进行eslint的配置。

### env&parserOptions

ESLint 允许你指定你想要支持的 JavaScript 语言选项。默认情况下，ESLint 支持 ECMAScript 5 语法。你可以覆盖该设置，以启用对 ECMAScript 其它版本和 JSX 的支持，为什么要把env跟parserOptions放在一起讲呢？ 因为env中包含了对parserOptions的配置，最终两个参数传入供给parse解析器使用。

#### env

我们的demo需要运行在es2020的浏览器环境中，所以我们的env配置为：

```js
{
  "env": {
    "browser": true,
    "es2020": true
  }
}
```

那么，env到底可以为设置为哪些呢？我们直接找到eslint的源码。

conf/environments.js：

```js
...
const newGlobals2015 = getDiff(globals.es2015, globals.es5); // 19 variables such as Promise, 
const newGlobals2017 = {
    Atomics: false,
    SharedArrayBuffer: false
};
const newGlobals2020 = {
    BigInt: false,
    BigInt64Array: false,
    BigUint64Array: false,
    globalThis: false
};

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/** @type {Map<string, import("../lib/shared/types").Environment>} */
module.exports = new Map(Object.entries({

    // Language
    builtin: {
        globals: globals.es5
    },
    es6: {
        globals: newGlobals2015,
        parserOptions: {
            ecmaVersion: 6
        }
    },
    es2015: {
        globals: newGlobals2015,
        parserOptions: {
            ecmaVersion: 6
        }
    },
    es2017: {
        globals: { ...newGlobals2015, ...newGlobals2017 },
        parserOptions: {
            ecmaVersion: 8
        }
    },
    es2020: {
        globals: { ...newGlobals2015, ...newGlobals2017, ...newGlobals2020 },
        parserOptions: {
            ecmaVersion: 11
        }
    },

    // Platforms
    browser: {
        globals: globals.browser
    },
    node: {
        globals: globals.node,
        parserOptions: {
            ecmaFeatures: {
                globalReturn: true
            }
        }
    },
    "shared-node-browser": {
        globals: globals["shared-node-browser"]
    },
    worker: {
        globals: globals.worker
    },
    serviceworker: {
        globals: globals.serviceworker
    },

    // Frameworks
    commonjs: {
        globals: globals.commonjs,
        parserOptions: {
            ecmaFeatures: {
                globalReturn: true
            }
        }
    },
    amd: {
        globals: globals.amd
    },
    mocha: {
        globals: globals.mocha
    },
    jasmine: {
        globals: globals.jasmine
    },
    jest: {
        globals: globals.jest
    },
    phantomjs: {
        globals: globals.phantomjs
    },
    jquery: {
        globals: globals.jquery
    },
    qunit: {
        globals: globals.qunit
    },
    prototypejs: {
        globals: globals.prototypejs
    },
    shelljs: {
        globals: globals.shelljs
    },
    meteor: {
        globals: globals.meteor
    },
    mongo: {
        globals: globals.mongo
    },
    protractor: {
        globals: globals.protractor
    },
    applescript: {
        globals: globals.applescript
    },
    nashorn: {
        globals: globals.nashorn
    },
    atomtest: {
        globals: globals.atomtest
    },
    embertest: {
        globals: globals.embertest
    },
    webextensions: {
        globals: globals.webextensions
    },
    greasemonkey: {
        globals: globals.greasemonkey
    }
}));

```

可以看到，默认是“builtin” 也就是es5，我们可以看到“es6”还可以叫“es2015”，然后还有一个“parserOptions”的配置：

```js
 es2015: {
        globals: newGlobals2015,
        parserOptions: {
            ecmaVersion: 6
        }
    },
```

那么parserOptions到底是什么呢？ 其实是给解析器用的参数，告诉解析器你需要利用ecmaVersion：6的语法去解析我们的源文件，那么globals属性里面又是什么东西呢？我们直接找到newGlobals2015然后点开源码，我们找到一个叫globals的第三方库，然后找到了一个叫globals.json的文件：

```json
{
  ...
  "es2015": {
		"Array": false,
		"ArrayBuffer": false,
		"Boolean": false,
		"constructor": false,
		"DataView": false,
		"Date": false,
		"decodeURI": false,
		"decodeURIComponent": false,
		"encodeURI": false,
		"encodeURIComponent": false,
		"Error": false,
		"escape": false,
		"eval": false,
		"EvalError": false,
		"Float32Array": false,
		"Float64Array": false,
		"Function": false,
		"hasOwnProperty": false,
		"Infinity": false,
		"Int16Array": false,
		"Int32Array": false,
		"Int8Array": false,
		"isFinite": false,
		"isNaN": false,
		"isPrototypeOf": false,
		"JSON": false,
		"Map": false,
		"Math": false,
		"NaN": false,
		"Number": false,
		"Object": false,
		"parseFloat": false,
		"parseInt": false,
		"Promise": false,
		"propertyIsEnumerable": false,
		"Proxy": false,
		"RangeError": false,
		"ReferenceError": false,
		"Reflect": false,
		"RegExp": false,
		"Set": false,
		"String": false,
		"Symbol": false,
		"SyntaxError": false,
		"toLocaleString": false,
		"toString": false,
		"TypeError": false,
		"Uint16Array": false,
		"Uint32Array": false,
		"Uint8Array": false,
		"Uint8ClampedArray": false,
		"undefined": false,
		"unescape": false,
		"URIError": false,
		"valueOf": false,
		"WeakMap": false,
		"WeakSet": false
	},
   ...
}
```

可以看到，其实就是我们es6中内置的对象、属性、方法，所以env是提供了一个es环境，parserOptions则是负责解析es语法。我们可以看到每一个变量都是一个boolean值，`false`代表这个变量不允许修改，`true`代表可以修改。

我们继续运行一下我们的demo：

```js
$npx eslint ./src/demo1.js
```

我们可以发现，我们控制台还是没啥反应，这是为什么呢？因为我们还没配置我们的rules，我们继续往下走。

#### parserOptions

- `sourceType` - 设置为 `"script"` (默认) 或 `"module"`（如果你的代码是 ECMAScript 模块)。

在看env的时候我们看到了parserOptions的一个参数“ecmaVersion”，那么ecmaVersion还有哪些配置呢？

ecmaVersion:

- `globalReturn` - 允许在全局作用域下使用 `return` 语句
- `impliedStrict` - 启用全局 [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) (如果 `ecmaVersion` 是 5 或更高)
- `jsx` - 启用 [JSX](http://facebook.github.io/jsx/)
- `experimentalObjectRestSpread` - 启用实验性的 [object rest/spread properties](https://github.com/sebmarkbage/ecmascript-rest-spread) 支持。(**重要：**这是一个实验性的功能,在未来可能会有明显改变。 建议你写的规则 **不要** 依赖该功能，除非当它发生改变时你愿意承担维护成本。)

我们可能会用到jsx，所以我们把`jsx`配置成为true

.eslintrc.json:

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
}
```

因为我们demo需要用到webpack模块打包，所以我们需要把`sourceType`设置成为module

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
 "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  }
}
```



### 解析器（Parser）

*抽象语法树*（Abstract Syntax Tree，*AST*），parse会把我们的源代码转换成抽象语法树，然后再对每个节点做eslint的校验，可以说是eslint中最重要的模块了，eslint默认使用的[Esprima](https://www.npmjs.com/package/esprima)作为ast工具，ast的工具还有acorn等，之前写过一篇关于babel的文章，感兴趣的小伙伴可以去看看[babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257),里面用到的就是acorn。

```
{
    "parser": "esprima",
    "rules": {
        "semi": "error"
    }
}
```

以下解析器与 ESLint 兼容：

- [Esprima](https://www.npmjs.com/package/esprima)
- [Babel-ESLint](https://www.npmjs.com/package/babel-eslint) - 一个对[Babel](https://babeljs.io/)解析器的包装，使其能够与 ESLint 兼容。
- [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser) - 将 TypeScript 转换成与 estree 兼容的形式，以便在ESLint中使用。

注意，在使用自定义解析器时，为了让 ESLint 在处理非 ECMAScript 5 特性时正常工作，配置属性 `parserOptions` 仍然是必须的。解析器会被传入 `parserOptions`，但是不一定会使用它们来决定功能特性的开关。

在线转换工具：https://astexplorer.net/

打开esprima的文档我们简单看一下：

README.md

```
​```javascript
const espree = require("espree");

const ast = espree.parse(code, options);

​```js
const options = {
    // attach range information to each node
    range: false,

    // attach line/column location information to each node
    loc: false,

    // create a top-level comments array containing all comments
    comment: false,

    // create a top-level tokens array containing all tokens
    tokens: false,

    // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
    // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), 2019 (same as 10), or 2020 (same as 11) to use the year-based naming.
    ecmaVersion: 5,

    // specify which type of script you're parsing ("script" or "module")
    sourceType: "script",

    // specify additional language features
    ecmaFeatures: {

        // enable JSX parsing
        jsx: false,

        // enable return in global scope
        globalReturn: false,

        // enable implied strict mode (if ecmaVersion >= 5)
        impliedStrict: false
    }
}
​```
```

可以看到，esprima接受的其实就是我们传递的parserOptions参数，那么在eslint的配置中我们怎么使用parse呢？

因为我们demo是需要加载.vue文件的，所以用默认的esprima解析肯定是不行的，所以我们安装一个vue-eslint-parser,

因为vue-eslint-parser直接是包含在eslint-plugin-vue中的，所以我们直接安装一个eslint-plugin-vue：

```
npm install -D eslint-plugin-vue
```

然后直接把vue-eslint-parser配置到eslint中

.eslintrc.json：

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
 "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser"
}
```

我们继续运行eslint：

```js
npx eslint ./src/*
```

运行后还是没任何反应，这是为什么呢？ 别慌，还没到我们的rules，我们继续～

### 处理器（Processor）

processor可以理解为在parse解析器要解析源文件之前跟eslint的rules处理过后的构造函数，也就是说可以在parse解析之前跟eslint的rules处理过后做一些事情，processor提供了两个钩子函数,我们先看一眼eslint-plugin-vue中提供的processor：

xxx/node_modules/eslint-plugin-vue/lib/processor.js

```js
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 */
'use strict'

module.exports = {
  preprocess (code) {
    console.log("code",code)
    return [code]
  },

  postprocess (messages) {
    const state = {
      block: {
        disableAll: false,
        disableRules: new Set()
      },
      line: {
        disableAll: false,
        disableRules: new Set()
      }
    }

    // Filter messages which are in disabled area.
    return messages[0].filter(message => {
      if (message.ruleId === 'vue/comment-directive') {
        const rules = message.message.split(' ')
        const type = rules.shift()
        const group = rules.shift()
        switch (type) {
          case '--':
            state[group].disableAll = true
            break
          case '++':
            state[group].disableAll = false
            break
          case '-':
            for (const rule of rules) {
              state[group].disableRules.add(rule)
            }
            break
          case '+':
            for (const rule of rules) {
              state[group].disableRules.delete(rule)
            }
            break
          case 'clear':
            state.block.disableAll = false
            state.block.disableRules.clear()
            state.line.disableAll = false
            state.line.disableRules.clear()
            break
        }
        return false
      } else {
        return !(
          state.block.disableAll ||
          state.line.disableAll ||
          state.block.disableRules.has(message.ruleId) ||
          state.line.disableRules.has(message.ruleId)
        )
      }
    })
  },

  supportsAutofix: true
}

```

里面的具体代码我们就一一解析了，我们后面在做自定义plugin的时候会详细说明一下processor，我们可以简单的看到两个回调函数，preprocess跟postprocess，preprocess是在parse解析源文件之前调用的方法，postprocess则是eslint的rules处理完毕后的回调函数。

那我们用一下eslint-plugin-vue的processor.

如果插件提供了processor的话，eslint会自动根据文件后缀调用processor，比如在eslint-plugin-vue的清单文件中我们可以看到：

xxx/node_modules/eslint-plugin-vue/lib/index.js

```js
/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "npm run update"
 */
'use strict'

module.exports = {
  rules: {
    ....
  },
  configs: {
    'base': require('./configs/base'),
    'essential': require('./configs/essential'),
    'no-layout-rules': require('./configs/no-layout-rules'),
    'recommended': require('./configs/recommended'),
    'strongly-recommended': require('./configs/strongly-recommended')
  },
  processors: {
    '.vue': require('./processor')
  }
}

```

我们可以看到vue提供了一个针对.vue文件的processors：

```js
 processors: {
    '.vue': require('./processor')
  }
```

接下来，我们用一下eslint-plugin-vue的processors，我们直接创建一个叫demo2.vue的文件：

demo2.vue

```jsx
<template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>

```

然后直接在eslint配置中使用eslint-plugin-vue插件：

.eslintrc.json：

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue"
  ]
}

```

为了看到点效果，我们直接在x x/node_modules/eslint-plugin-vue/lib/processor.js源代码中打个console：

```js
module.exports = {
  preprocess (code) {
    console.log("code",code)
    return [code]
  },
  ...
```

然后运行eslint：

```
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./src/*
code <template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，processor打印了我们的源代码。

plugin引入的话只会针对.vue文件做处理，那如果我们需要对项目中所有的文件做处理的话该怎么做呢？

我们直接修改一下配置：

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue"
  ],
  "processor": "vue/.vue"
}

```

我们继续运行eslint：

```
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./src/*
code document.write("hello eslint");
code <template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>

➜  eslint-demo git:(v0.0.1) ✗ 


```

可以看到，我们demo1.js跟demo2.vue的源码都打印了一遍。

好啦，processor就先讲到这里了，后面在自定义plugin的时候具体在对每个方法做解析。

### 全局变量（Globals）

这个配置比较好理解，就是我们在env配置的全局变量，如果我们需要添加、禁用某些全局变量的话，我们可以放在Globals配置中，

当访问当前源文件内未定义的变量时，[no-undef](https://eslint.bootcss.com/docs/rules/no-undef) 规则将发出警告。如果你想在一个源文件里使用全局变量，推荐你在 ESLint 中定义这些全局变量，这样 ESLint 就不会发出警告了。你可以使用注释或在配置文件中定义全局变量。

要在你的 JavaScript 文件中，用注释指定全局变量，格式如下：

```
/* global var1, var2 */
```

这定义了两个全局变量，`var1` 和 `var2`。如果你想选择性地指定这些全局变量可以被写入(而不是只被读取)，那么你可以用一个 `"writable"` 的标志来设置它们:

```
/* global var1:writable, var2:writable */
```

要在配置文件中配置全局变量，请将 `globals` 配置属性设置为一个对象，该对象包含以你希望使用的每个全局变量。对于每个全局变量键，将对应的值设置为 `"writable"` 以允许重写变量，或 `"readonly"` 不允许重写变量。例如：

```
{
    "globals": {
        "var1": "writable",
        "var2": "readonly"
    }
}
```

在 YAML 中：

```
---
  globals:
    var1: writable
    var2: readonly
```

在这些例子中 `var1` 允许被重写，`var2` 不允许被重写。

可以使用字符串 `"off"` 禁用全局变量。例如，在大多数 ES2015 全局变量可用但 `Promise` 不可用的环境中，你可以使用以下配置:

```
{
    "env": {
        "es6": true
    },
    "globals": {
        "Promise": "off"
    }
}
```

由于历史原因，布尔值 `false` 和字符串值 `"readable"` 等价于 `"readonly"`。类似地，布尔值 `true` 和字符串值 `"writeable"` 等价于 `"writable"`。但是，不建议使用旧值。

比如我们有一个全局的fox变量，我们需要在globals声明一下,并且为只读。我们创建一个demo-global-fox.js文件：

demo-global-fox.js

```js
fox.say("hello");
```

修改一下我们的配置信息：

.eslintrc.json

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue"
  ],
  "processor": "vue/.vue",
  "globals": {
    "fox": "readonly"
  }
}

```

### 插件（Plugins）

ESLint 支持使用第三方插件。在使用插件之前，你必须使用 npm 安装它。比如我们这里使用了eslint-plugin-vue插件，在配置文件里配置插件时，可以使用 `plugins` 关键字来存放插件名字的列表。插件名称可以省略 `eslint-plugin-` 前缀。

```json
{
    "plugins": [
        "vue",
        "eslint-plugin-vue"
    ]
}
```

两种方式都是可以的，有些第三方插件可能还带有命名空间，比如@typescirpt-eslint/eslint-plugin插件，每个插件是一个命名格式为 `eslint-plugin-` 的 npm 模块，比如 `eslint-plugin-jquery`。你也可以用这样的格式 `@/eslint-plugin-` 限定在包作用域下，比如 `@jquery/eslint-plugin-jquery`。

我们引用的时候可以直接带上命名空间即可，比如引用@typescirpt-eslint/eslint-plugin插件和`@jquery/eslint-plugin-jquery`插件：

```json
{
    "plugins": [
        "@typescirpt-eslint",
      	"@jquery/jquery`"
    ]
}
```



前面说了我们demo需要支持typescript，所以我们demo中装一下@typescirpt-eslint/eslint-plugin插件：

```js
npm install -S typescript && npm install -D @typescript-eslint/eslint-plugin && npm install -D @typescript-eslint/parser
```

package.json

```json
{
  "name": "eslint-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "typescript": "^3.9.5"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^3.3.0",
    "@typescript-eslint/parser": "^3.3.0",
    "eslint": "^7.3.0",
    "eslint-plugin-vue": "^6.2.2"
  }
}
```

.eslintrc.json:

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "processor": "vue/.vue",
  "globals": {
    "fox": "readonly"
  }
}

```

### 规则（Rules）

终于是讲到rules了，rules其实就是eslint中定义的代码规则，其实eslint也就是一系列的规则的组合，由于我们前面并没有对我们的demo做任何rules配置，所以我们每次执行eslint的时候都没有一点反应，接下里我们结合demo做一下rules的配置。

比如我们需要在代码语句结束强制加分号“;”

我们创建一个demo-semi.js文件：

demo-semi.js

```js
document.write("hello eslint")
```



然后在配置文件中配置semi规则：

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "processor": "vue/.vue",
  "globals": {
    "fox": "readonly"
  },
  "rules": {
    "semi": [
      "error",
      "always"
    ]
  }
}

```

运行eslint：

```
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./src/*
code fox.say("hello");
code document.write("hello eslint")
code document.write("hello eslint");
code <template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>


xx/Study/eslint-demo/src/demo-semi.js
  1:31  error  Missing semicolon  semi

✖ 1 problem (1 error, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，我们终端中直接报错了

```
xx/eslint-demo/src/demo-semi.js
  1:31  error  Missing semicolon  semi

✖ 1 problem (1 error, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

```

哈哈，终于是看点东西了，不容易啊～ 

再来一个，比如我们需要在代码中用双引号“”

.eslintrc.json:

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "processor": "vue/.vue",
  "globals": {
    "fox": "readonly"
  },
  "rules": {
    "semi": [
      "error",
      "always"
    ],
    "quotes": ["error", "double"]
  }
}

```

运行eslint：

```
➜  eslint-demo git:(v0.0.1) ✗ npx eslint ./src/*
code fox.say("hello");
code document.write("hello eslint")
code document.write("hello eslint");
code <template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>


xx/Study/eslint-demo/src/demo-semi.js
  1:31  error  Missing semicolon  semi

xx/Study/eslint-demo/src/demo2.vue
  5:11  error  Strings must use doublequote  quotes

✖ 2 problems (2 errors, 0 warnings)
  2 errors and 0 warnings potentially fixable with the `--fix` option.

➜  eslint-demo git:(v0.0.1) ✗ 

```

可以看到，我们代码中有两处报错了，demo-semi.js跟demo2.vue

demo-semi.js（没有加分号）：

```js
document.write("hello eslint")
```

demo2.vue（没有用双引号）：

```jsx
<template>
</template>
<script>
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>
```

有小伙伴可能要疑问了，semi跟quotes从哪来的呢？ 我可不可以定义一个叫xxx的规则呢？

下面一个一个解答：

semi跟quotes从哪来的呢？

我们翻开eslint的源码：

lib/rules/index.js

```js
/**
 * @fileoverview Collects the built-in rules into a map structure so that they can be imported all at once and without
 * using the file-system directly.
 * @author Peter (Somogyvari) Metz
 */

"use strict";

/* eslint sort-keys: ["error", "asc"] */

const { LazyLoadingRuleMap } = require("./utils/lazy-loading-rule-map");

/** @type {Map<string, import("../shared/types").Rule>} */
module.exports = new LazyLoadingRuleMap(Object.entries({
    "accessor-pairs": () => require("./accessor-pairs"),
    "array-bracket-newline": () => require("./array-bracket-newline"),
    "array-bracket-spacing": () => require("./array-bracket-spacing"),
    "array-callback-return": () => require("./array-callback-return"),
    "array-element-newline": () => require("./array-element-newline"),
    "arrow-body-style": () => require("./arrow-body-style"),
    "arrow-parens": () => require("./arrow-parens"),
    "arrow-spacing": () => require("./arrow-spacing"),
    "block-scoped-var": () => require("./block-scoped-var"),
    "block-spacing": () => require("./block-spacing"),
    "brace-style": () => require("./brace-style"),
    "callback-return": () => require("./callback-return"),
    camelcase: () => require("./camelcase"),
    "capitalized-comments": () => require("./capitalized-comments"),
    "class-methods-use-this": () => require("./class-methods-use-this"),
    "comma-dangle": () => require("./comma-dangle"),
    "comma-spacing": () => require("./comma-spacing"),
    "comma-style": () => require("./comma-style"),
    complexity: () => require("./complexity"),
    "computed-property-spacing": () => require("./computed-property-spacing"),
    "consistent-return": () => require("./consistent-return"),
    "consistent-this": () => require("./consistent-this"),
    "constructor-super": () => require("./constructor-super"),
    curly: () => require("./curly"),
    "default-case": () => require("./default-case"),
    "default-case-last": () => require("./default-case-last"),
    "default-param-last": () => require("./default-param-last"),
    "dot-location": () => require("./dot-location"),
    "dot-notation": () => require("./dot-notation"),
    "eol-last": () => require("./eol-last"),
    eqeqeq: () => require("./eqeqeq"),
    "for-direction": () => require("./for-direction"),
    "func-call-spacing": () => require("./func-call-spacing"),
    "func-name-matching": () => require("./func-name-matching"),
    "func-names": () => require("./func-names"),
    "func-style": () => require("./func-style"),
    "function-call-argument-newline": () => require("./function-call-argument-newline"),
    "function-paren-newline": () => require("./function-paren-newline"),
    "generator-star-spacing": () => require("./generator-star-spacing"),
    "getter-return": () => require("./getter-return"),
    "global-require": () => require("./global-require"),
    "grouped-accessor-pairs": () => require("./grouped-accessor-pairs"),
    "guard-for-in": () => require("./guard-for-in"),
    "handle-callback-err": () => require("./handle-callback-err"),
    "id-blacklist": () => require("./id-blacklist"),
    "id-length": () => require("./id-length"),
    "id-match": () => require("./id-match"),
    "implicit-arrow-linebreak": () => require("./implicit-arrow-linebreak"),
    indent: () => require("./indent"),
    "indent-legacy": () => require("./indent-legacy"),
    "init-declarations": () => require("./init-declarations"),
    "jsx-quotes": () => require("./jsx-quotes"),
    "key-spacing": () => require("./key-spacing"),
    "keyword-spacing": () => require("./keyword-spacing"),
    "line-comment-position": () => require("./line-comment-position"),
    "linebreak-style": () => require("./linebreak-style"),
    "lines-around-comment": () => require("./lines-around-comment"),
    "lines-around-directive": () => require("./lines-around-directive"),
    "lines-between-class-members": () => require("./lines-between-class-members"),
    "max-classes-per-file": () => require("./max-classes-per-file"),
    "max-depth": () => require("./max-depth"),
    "max-len": () => require("./max-len"),
    "max-lines": () => require("./max-lines"),
    "max-lines-per-function": () => require("./max-lines-per-function"),
    "max-nested-callbacks": () => require("./max-nested-callbacks"),
    "max-params": () => require("./max-params"),
    "max-statements": () => require("./max-statements"),
    "max-statements-per-line": () => require("./max-statements-per-line"),
    "multiline-comment-style": () => require("./multiline-comment-style"),
    "multiline-ternary": () => require("./multiline-ternary"),
    "new-cap": () => require("./new-cap"),
    "new-parens": () => require("./new-parens"),
    "newline-after-var": () => require("./newline-after-var"),
    "newline-before-return": () => require("./newline-before-return"),
    "newline-per-chained-call": () => require("./newline-per-chained-call"),
    "no-alert": () => require("./no-alert"),
    "no-array-constructor": () => require("./no-array-constructor"),
    "no-async-promise-executor": () => require("./no-async-promise-executor"),
    "no-await-in-loop": () => require("./no-await-in-loop"),
    "no-bitwise": () => require("./no-bitwise"),
    "no-buffer-constructor": () => require("./no-buffer-constructor"),
    "no-caller": () => require("./no-caller"),
    "no-case-declarations": () => require("./no-case-declarations"),
    "no-catch-shadow": () => require("./no-catch-shadow"),
    "no-class-assign": () => require("./no-class-assign"),
    "no-compare-neg-zero": () => require("./no-compare-neg-zero"),
    "no-cond-assign": () => require("./no-cond-assign"),
    "no-confusing-arrow": () => require("./no-confusing-arrow"),
    "no-console": () => require("./no-console"),
    "no-const-assign": () => require("./no-const-assign"),
    "no-constant-condition": () => require("./no-constant-condition"),
    "no-constructor-return": () => require("./no-constructor-return"),
    "no-continue": () => require("./no-continue"),
    "no-control-regex": () => require("./no-control-regex"),
    "no-debugger": () => require("./no-debugger"),
    "no-delete-var": () => require("./no-delete-var"),
    "no-div-regex": () => require("./no-div-regex"),
    "no-dupe-args": () => require("./no-dupe-args"),
    "no-dupe-class-members": () => require("./no-dupe-class-members"),
    "no-dupe-else-if": () => require("./no-dupe-else-if"),
    "no-dupe-keys": () => require("./no-dupe-keys"),
    "no-duplicate-case": () => require("./no-duplicate-case"),
    "no-duplicate-imports": () => require("./no-duplicate-imports"),
    "no-else-return": () => require("./no-else-return"),
    "no-empty": () => require("./no-empty"),
    "no-empty-character-class": () => require("./no-empty-character-class"),
    "no-empty-function": () => require("./no-empty-function"),
    "no-empty-pattern": () => require("./no-empty-pattern"),
    "no-eq-null": () => require("./no-eq-null"),
    "no-eval": () => require("./no-eval"),
    "no-ex-assign": () => require("./no-ex-assign"),
    "no-extend-native": () => require("./no-extend-native"),
    "no-extra-bind": () => require("./no-extra-bind"),
    "no-extra-boolean-cast": () => require("./no-extra-boolean-cast"),
    "no-extra-label": () => require("./no-extra-label"),
    "no-extra-parens": () => require("./no-extra-parens"),
    "no-extra-semi": () => require("./no-extra-semi"),
    "no-fallthrough": () => require("./no-fallthrough"),
    "no-floating-decimal": () => require("./no-floating-decimal"),
    "no-func-assign": () => require("./no-func-assign"),
    "no-global-assign": () => require("./no-global-assign"),
    "no-implicit-coercion": () => require("./no-implicit-coercion"),
    "no-implicit-globals": () => require("./no-implicit-globals"),
    "no-implied-eval": () => require("./no-implied-eval"),
    "no-import-assign": () => require("./no-import-assign"),
    "no-inline-comments": () => require("./no-inline-comments"),
    "no-inner-declarations": () => require("./no-inner-declarations"),
    "no-invalid-regexp": () => require("./no-invalid-regexp"),
    "no-invalid-this": () => require("./no-invalid-this"),
    "no-irregular-whitespace": () => require("./no-irregular-whitespace"),
    "no-iterator": () => require("./no-iterator"),
    "no-label-var": () => require("./no-label-var"),
    "no-labels": () => require("./no-labels"),
    "no-lone-blocks": () => require("./no-lone-blocks"),
    "no-lonely-if": () => require("./no-lonely-if"),
    "no-loop-func": () => require("./no-loop-func"),
    "no-loss-of-precision": () => require("./no-loss-of-precision"),
    "no-magic-numbers": () => require("./no-magic-numbers"),
    "no-misleading-character-class": () => require("./no-misleading-character-class"),
    "no-mixed-operators": () => require("./no-mixed-operators"),
    "no-mixed-requires": () => require("./no-mixed-requires"),
    "no-mixed-spaces-and-tabs": () => require("./no-mixed-spaces-and-tabs"),
    "no-multi-assign": () => require("./no-multi-assign"),
    "no-multi-spaces": () => require("./no-multi-spaces"),
    "no-multi-str": () => require("./no-multi-str"),
    "no-multiple-empty-lines": () => require("./no-multiple-empty-lines"),
    "no-native-reassign": () => require("./no-native-reassign"),
    "no-negated-condition": () => require("./no-negated-condition"),
    "no-negated-in-lhs": () => require("./no-negated-in-lhs"),
    "no-nested-ternary": () => require("./no-nested-ternary"),
    "no-new": () => require("./no-new"),
    "no-new-func": () => require("./no-new-func"),
    "no-new-object": () => require("./no-new-object"),
    "no-new-require": () => require("./no-new-require"),
    "no-new-symbol": () => require("./no-new-symbol"),
    "no-new-wrappers": () => require("./no-new-wrappers"),
    "no-obj-calls": () => require("./no-obj-calls"),
    "no-octal": () => require("./no-octal"),
    "no-octal-escape": () => require("./no-octal-escape"),
    "no-param-reassign": () => require("./no-param-reassign"),
    "no-path-concat": () => require("./no-path-concat"),
    "no-plusplus": () => require("./no-plusplus"),
    "no-process-env": () => require("./no-process-env"),
    "no-process-exit": () => require("./no-process-exit"),
    "no-promise-executor-return": () => require("./no-promise-executor-return"),
    "no-proto": () => require("./no-proto"),
    "no-prototype-builtins": () => require("./no-prototype-builtins"),
    "no-redeclare": () => require("./no-redeclare"),
    "no-regex-spaces": () => require("./no-regex-spaces"),
    "no-restricted-exports": () => require("./no-restricted-exports"),
    "no-restricted-globals": () => require("./no-restricted-globals"),
    "no-restricted-imports": () => require("./no-restricted-imports"),
    "no-restricted-modules": () => require("./no-restricted-modules"),
    "no-restricted-properties": () => require("./no-restricted-properties"),
    "no-restricted-syntax": () => require("./no-restricted-syntax"),
    "no-return-assign": () => require("./no-return-assign"),
    "no-return-await": () => require("./no-return-await"),
    "no-script-url": () => require("./no-script-url"),
    "no-self-assign": () => require("./no-self-assign"),
    "no-self-compare": () => require("./no-self-compare"),
    "no-sequences": () => require("./no-sequences"),
    "no-setter-return": () => require("./no-setter-return"),
    "no-shadow": () => require("./no-shadow"),
    "no-shadow-restricted-names": () => require("./no-shadow-restricted-names"),
    "no-spaced-func": () => require("./no-spaced-func"),
    "no-sparse-arrays": () => require("./no-sparse-arrays"),
    "no-sync": () => require("./no-sync"),
    "no-tabs": () => require("./no-tabs"),
    "no-template-curly-in-string": () => require("./no-template-curly-in-string"),
    "no-ternary": () => require("./no-ternary"),
    "no-this-before-super": () => require("./no-this-before-super"),
    "no-throw-literal": () => require("./no-throw-literal"),
    "no-trailing-spaces": () => require("./no-trailing-spaces"),
    "no-undef": () => require("./no-undef"),
    "no-undef-init": () => require("./no-undef-init"),
    "no-undefined": () => require("./no-undefined"),
    "no-underscore-dangle": () => require("./no-underscore-dangle"),
    "no-unexpected-multiline": () => require("./no-unexpected-multiline"),
    "no-unmodified-loop-condition": () => require("./no-unmodified-loop-condition"),
    "no-unneeded-ternary": () => require("./no-unneeded-ternary"),
    "no-unreachable": () => require("./no-unreachable"),
    "no-unreachable-loop": () => require("./no-unreachable-loop"),
    "no-unsafe-finally": () => require("./no-unsafe-finally"),
    "no-unsafe-negation": () => require("./no-unsafe-negation"),
    "no-unused-expressions": () => require("./no-unused-expressions"),
    "no-unused-labels": () => require("./no-unused-labels"),
    "no-unused-vars": () => require("./no-unused-vars"),
    "no-use-before-define": () => require("./no-use-before-define"),
    "no-useless-backreference": () => require("./no-useless-backreference"),
    "no-useless-call": () => require("./no-useless-call"),
    "no-useless-catch": () => require("./no-useless-catch"),
    "no-useless-computed-key": () => require("./no-useless-computed-key"),
    "no-useless-concat": () => require("./no-useless-concat"),
    "no-useless-constructor": () => require("./no-useless-constructor"),
    "no-useless-escape": () => require("./no-useless-escape"),
    "no-useless-rename": () => require("./no-useless-rename"),
    "no-useless-return": () => require("./no-useless-return"),
    "no-var": () => require("./no-var"),
    "no-void": () => require("./no-void"),
    "no-warning-comments": () => require("./no-warning-comments"),
    "no-whitespace-before-property": () => require("./no-whitespace-before-property"),
    "no-with": () => require("./no-with"),
    "nonblock-statement-body-position": () => require("./nonblock-statement-body-position"),
    "object-curly-newline": () => require("./object-curly-newline"),
    "object-curly-spacing": () => require("./object-curly-spacing"),
    "object-property-newline": () => require("./object-property-newline"),
    "object-shorthand": () => require("./object-shorthand"),
    "one-var": () => require("./one-var"),
    "one-var-declaration-per-line": () => require("./one-var-declaration-per-line"),
    "operator-assignment": () => require("./operator-assignment"),
    "operator-linebreak": () => require("./operator-linebreak"),
    "padded-blocks": () => require("./padded-blocks"),
    "padding-line-between-statements": () => require("./padding-line-between-statements"),
    "prefer-arrow-callback": () => require("./prefer-arrow-callback"),
    "prefer-const": () => require("./prefer-const"),
    "prefer-destructuring": () => require("./prefer-destructuring"),
    "prefer-exponentiation-operator": () => require("./prefer-exponentiation-operator"),
    "prefer-named-capture-group": () => require("./prefer-named-capture-group"),
    "prefer-numeric-literals": () => require("./prefer-numeric-literals"),
    "prefer-object-spread": () => require("./prefer-object-spread"),
    "prefer-promise-reject-errors": () => require("./prefer-promise-reject-errors"),
    "prefer-reflect": () => require("./prefer-reflect"),
    "prefer-regex-literals": () => require("./prefer-regex-literals"),
    "prefer-rest-params": () => require("./prefer-rest-params"),
    "prefer-spread": () => require("./prefer-spread"),
    "prefer-template": () => require("./prefer-template"),
    "quote-props": () => require("./quote-props"),
    quotes: () => require("./quotes"),
    radix: () => require("./radix"),
    "require-atomic-updates": () => require("./require-atomic-updates"),
    "require-await": () => require("./require-await"),
    "require-jsdoc": () => require("./require-jsdoc"),
    "require-unicode-regexp": () => require("./require-unicode-regexp"),
    "require-yield": () => require("./require-yield"),
    "rest-spread-spacing": () => require("./rest-spread-spacing"),
    semi: () => require("./semi"),
    "semi-spacing": () => require("./semi-spacing"),
    "semi-style": () => require("./semi-style"),
    "sort-imports": () => require("./sort-imports"),
    "sort-keys": () => require("./sort-keys"),
    "sort-vars": () => require("./sort-vars"),
    "space-before-blocks": () => require("./space-before-blocks"),
    "space-before-function-paren": () => require("./space-before-function-paren"),
    "space-in-parens": () => require("./space-in-parens"),
    "space-infix-ops": () => require("./space-infix-ops"),
    "space-unary-ops": () => require("./space-unary-ops"),
    "spaced-comment": () => require("./spaced-comment"),
    strict: () => require("./strict"),
    "switch-colon-spacing": () => require("./switch-colon-spacing"),
    "symbol-description": () => require("./symbol-description"),
    "template-curly-spacing": () => require("./template-curly-spacing"),
    "template-tag-spacing": () => require("./template-tag-spacing"),
    "unicode-bom": () => require("./unicode-bom"),
    "use-isnan": () => require("./use-isnan"),
    "valid-jsdoc": () => require("./valid-jsdoc"),
    "valid-typeof": () => require("./valid-typeof"),
    "vars-on-top": () => require("./vars-on-top"),
    "wrap-iife": () => require("./wrap-iife"),
    "wrap-regex": () => require("./wrap-regex"),
    "yield-star-spacing": () => require("./yield-star-spacing"),
    yoda: () => require("./yoda")
}));

```

我们可以找到我们的semi跟quotes，还有一些其它的rule，每个rule的具体含义小伙伴可以自己去看eslint的官网或源码哦，里面都有说明的。

ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置，你必须将规则 ID 设置为下列值之一：

- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出)
- `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出)

#### 在代码中配置（Comments）

为了在文件注释里配置规则，使用以下格式的注释：

```
/* eslint eqeqeq: "off", curly: "error" */
```

在这个例子里，[`eqeqeq`](https://eslint.bootcss.com/docs/rules/eqeqeq) 规则被关闭，[`curly`](https://eslint.bootcss.com/docs/rules/curly) 规则被打开，定义为错误级别。你也可以使用对应的数字定义规则严重程度：

```
/* eslint eqeqeq: 0, curly: 2 */
```

这个例子和上个例子是一样的，只不过它是用的数字而不是字符串。`eqeqeq` 规则是关闭的，`curly` 规则被设置为错误级别。

如果一个规则有额外的选项，你可以使用数组字面量指定它们，比如：

```
/* eslint quotes: ["error", "double"], curly: 2 */
```

这条注释为规则 [`quotes`](https://eslint.bootcss.com/docs/rules/quotes) 指定了 “double”选项。数组的第一项总是规则的严重程度（数字或字符串）。

比如我们的demo2.vue文件：

```jsx
<template>
</template>
<script>
/* eslint quotes: ["error", "double"] */
export default{
    name: 'demo2',
};
</script>
<style lang='scss' scoped>
</style>

```

我们添加了一个/* eslint quotes: ["error", "double"] */注释，其实跟配置文件加rules一样的效果，只是配置文件加rules是作用于所有的文件。

#### 在config文件中配置（rules）

这个我们已经演示过了，比如：

```json
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}
```



 我可不可以定义一个叫xxx的规则呢？

可以！ 自定义规则我们会在自定义plugin的时候详细讲解。