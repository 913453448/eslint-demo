## 开始

我们直接clone一份eslint的源码

```
git clone https://github.com/eslint/eslint.git
```

为了更好的理解源码，我直接贴一张自己整理的eslint的流程图，我们对照流程图再一步步解析源码

![eslint流程图](/Users/ocj1/WebstormProjects/Study/eslint-demo/eslint流程图.png)

## bin

我们首先找到了eslint命令的入口文件

bin/eslint.js：

```js
...
(async function main() {
   ...
    process.exitCode = await require("../lib/cli").execute(
        process.argv,
        process.argv.includes("--stdin") ? await readStdin() : null
    );
}()).catch(onFatalError);
```

在命令的入口文件中我们可以看到，直接引用了../lib/cli文件，然后执行了cli的execute方法，所以我们找到cli文件

lib/cli.js:

```js
...
const cli = {
    async execute(args, text) {
       	...
            const engine = new ESLint(translateOptions(options));
            const fileConfig =
                await engine.calculateConfigForFile(options.printConfig);

            log.info(JSON.stringify(fileConfig, null, "  "));
            return 0;
        }
				...
  			//支持输出入输入内容做校验
        if (useStdin) {
            results = await engine.lintText(text, {
                filePath: options.stdinFilename,
                warnIgnored: true
            });
        } else {
          	//执行需要校验的文件
            results = await engine.lintFiles(files);
        }
		...
};

module.exports = cli;
```

可以看到，如果是传入的文件信息的话，就直接执行需要校验的文件engine.lintFiles(files)，

所以我们继续往下看engine.lintFiles方法。

lib/eslint/eslint.js：

```js
 async lintFiles(patterns) {
        if (!isNonEmptyString(patterns) && !isArrayOfNonEmptyString(patterns)) {
            throw new Error("'patterns' must be a non-empty string or an array of non-empty strings");
        }
        const { cliEngine } = privateMembersMap.get(this);

        return processCLIEngineLintReport(
            cliEngine,
            cliEngine.executeOnFiles(patterns)
        );
    }
```

lintFiles方法直接执行了一个叫executeOnFiles的方法，

lib/cli-engine/cli-engine.js：

```js
executeOnFiles(patterns) {
        ...
            // Do lint.
            const result = verifyText({
                text: fs.readFileSync(filePath, "utf8"),
                filePath,
                config,
                cwd,
                fix,
                allowInlineConfig,
                reportUnusedDisableDirectives,
                fileEnumerator,
                linter
            });

            results.push(result);
					...
        return {
            results,
            ...calculateStatsPerRun(results),

            // Initialize it lazily because CLI and `ESLint` API don't use it.
            get usedDeprecatedRules() {
                if (!usedDeprecatedRules) {
                    usedDeprecatedRules = Array.from(
                        iterateRuleDeprecationWarnings(lastConfigArrays)
                    );
                }
                return usedDeprecatedRules;
            }
        };
    }

```

可以看到，executeOnFiles方法直接执行了一个叫verifyText的方法，所以我们继续往下。

## verify

我们已经跑到了流程图中的verify了，我们看一下verifyText方法，

lib/cli-engine/cli-engine.js：

```js
function verifyText({
    text,
    cwd,
    filePath: providedFilePath,
    config,
    fix,
    allowInlineConfig,
    reportUnusedDisableDirectives,
    fileEnumerator,
    linter
}) {
   ...
    const filePathToVerify = filePath === "<text>" ? path.join(cwd, filePath) : filePath;
    const { fixed, messages, output } = linter.verifyAndFix(
        text,
        config,
        {
            allowInlineConfig,
            filename: filePathToVerify,
            fix,
            reportUnusedDisableDirectives,
		...
            filterCodeBlock(blockFilename) {
                return fileEnumerator.isTargetPath(blockFilename);
            }
        }
    );

    // Tweak and return.
    const result = {
        filePath,
        messages,
        ...calculateStatsPerFile(messages)
    };
...
    return result;
}
```

在verifyText方法中，我们看到又直接掉用了linter的verifyAndFix方法，然后封装verifyAndFix方法的结果直接返回result,所以我们找到linter的verifyAndFix方法。

lib/linter/linter.js:

```js
verifyAndFix(text, config, options) {
        let messages = [],
            fixedResult,
            fixed = false,
            passNumber = 0,
            currentText = text;
       ...
        do {
            passNumber++;
          	//执行验证流程
            messages = this.verify(currentText, config, options);
          	//如果需要修复就执行修复
            fixedResult = SourceCodeFixer.applyFixes(currentText, messages, shouldFix);
          	...
        } while (
            fixedResult.fixed &&
            passNumber < MAX_AUTOFIX_PASSES
        );
			
			...
      	//返回修复过后的结果
        return fixedResult;
    }
}
```

可以看到，执行了verify方法（也就是我们定义的rules），拿到验证结果，如果需要修复的话（也就是加了--fix选项）就直接调用SourceCodeFixer.applyFixes方法进行源码修复，最后返回结果。

我们先看一下verify方法：

```js
  verify(textOrSourceCode, config, filenameOrOptions) {
     	...
      //如果配置中有preprocess或者postprocess函数
        if (options.preprocess || options.postprocess) {
            return this._verifyWithProcessor(textOrSourceCode, config, options);
        }
        return this._verifyWithoutProcessors(textOrSourceCode, config, options);
    }
```

## preprocess？

如果有preprocess或者postprocess的时候，就执行了一个叫_verifyWithProcessor的方法，

lib/linter/linter.js:

```js
 _verifyWithProcessor(textOrSourceCode, config, options, configForRecursive) {
        const filename = options.filename || "<input>";
        const filenameToExpose = normalizeFilename(filename);
        const text = ensureText(textOrSourceCode);
        const preprocess = options.preprocess || (rawText => [rawText]);
        const postprocess = options.postprocess || lodash.flatten;
        const filterCodeBlock =
            options.filterCodeBlock ||
            (blockFilename => blockFilename.endsWith(".js"));
        const originalExtname = path.extname(filename);
        const messageLists = preprocess(text, filenameToExpose).map((block, i) => {
            debug("A code block was found: %o", block.filename || "(unnamed)");

            // Keep the legacy behavior.
            if (typeof block === "string") {
                return this._verifyWithoutProcessors(block, config, options);
            }

            const blockText = block.text;
            const blockName = path.join(filename, `${i}_${block.filename}`);

            // Skip this block if filtered.
            if (!filterCodeBlock(blockName, blockText)) {
                debug("This code block was skipped.");
                return [];
            }

            // Resolve configuration again if the file extension was changed.
            if (configForRecursive && path.extname(blockName) !== originalExtname) {
                debug("Resolving configuration again because the file extension was changed.");
                return this._verifyWithConfigArray(
                    blockText,
                    configForRecursive,
                    { ...options, filename: blockName }
                );
            }

            // Does lint.
            return this._verifyWithoutProcessors(
                blockText,
                config,
                { ...options, filename: blockName }
            );
        });

        return postprocess(messageLists, filenameToExpose);
    }
```

可以看到_verifyWithProcessor方法中调用了配置的preprocess方法，把源码text传给了它，然后获取preprocess方法返回代码块，继续调用了_verifyWithoutProcessors方法，

## parse

lib/linter/linter.js：

```js
 _verifyWithoutProcessors(textOrSourceCode, providedConfig, providedOptions) {
       ...
       //获取解析器并且解析文件为ast对象
            const parseResult = parse(
                text,
                parser,
                parserOptions,
                options.filename
            );
			...

        try {
          //执行rules
            lintingProblems = runRules(
                sourceCode,
                configuredRules,
                ruleId => getRule(slots, ruleId),
                parserOptions,
                parserName,
                settings,
                options.filename,
                options.disableFixes,
                slots.cwd
            );
        } catch (err) {
           ...
        }
    }
```

可以看到，_verifyWithoutProcessors方法中去获取了解析器parser（espree），然后通过espree解析源码为ast对象，最后把ast对象当成sourceCode传递给了runRules方法。

## runRules

lib/linter/linter.js:

```js
function runRules(sourceCode, configuredRules, ruleMapper, parserOptions, parserName, settings, filename, disableFixes, cwd) {
   ...
    Traverser.traverse(sourceCode.ast, {
        enter(node, parent) {
            node.parent = parent;
            nodeQueue.push({ isEntering: true, node });
        },
        leave(node) {
            nodeQueue.push({ isEntering: false, node });
        },
        visitorKeys: sourceCode.visitorKeys
    });

    /*
     * Create a frozen object with the ruleContext properties and methods that are shared by all rules.
     * All rule contexts will inherit from this object. This avoids the performance penalty of copying all the
     * properties once for each rule.
     */
    const sharedTraversalContext = Object.freeze(
        Object.assign(
            Object.create(BASE_TRAVERSAL_CONTEXT),
            {
                getAncestors: () => getAncestors(currentNode),
                getDeclaredVariables: sourceCode.scopeManager.getDeclaredVariables.bind(sourceCode.scopeManager),
                getCwd: () => cwd,
                getFilename: () => filename,
                getScope: () => getScope(sourceCode.scopeManager, currentNode),
                getSourceCode: () => sourceCode,
                markVariableAsUsed: name => markVariableAsUsed(sourceCode.scopeManager, currentNode, parserOptions, name),
                parserOptions,
                parserPath: parserName,
                parserServices: sourceCode.parserServices,
                settings
            }
        )
    );


    const lintingProblems = [];

    Object.keys(configuredRules).forEach(ruleId => {
        const severity = ConfigOps.getRuleSeverity(configuredRules[ruleId]);

        // not load disabled rules
        if (severity === 0) {
            return;
        }

        const rule = ruleMapper(ruleId);

        if (rule === null) {
            lintingProblems.push(createLintingProblem({ ruleId }));
            return;
        }

        const messageIds = rule.meta && rule.meta.messages;
        let reportTranslator = null;
        const ruleContext = Object.freeze(
            Object.assign(
                Object.create(sharedTraversalContext),
                {
                    id: ruleId,
                    options: getRuleOptions(configuredRules[ruleId]),
                    report(...args) {
                        if (reportTranslator === null) {
                            reportTranslator = createReportTranslator({
                                ruleId,
                                severity,
                                sourceCode,
                                messageIds,
                                disableFixes
                            });
                        }
                        const problem = reportTranslator(...args);

                        if (problem.fix && rule.meta && !rule.meta.fixable) {
                            throw new Error("Fixable rules should export a `meta.fixable` property.");
                        }
                        lintingProblems.push(problem);
                    }
                }
            )
        );
		...
    return lintingProblems;
}
```

通过espress编译器编译过后的源码变成了一个ast对象，ast就是抽象语法树的意思，我记得我在babel解析的时候也提到过ast，其实babel的原理跟eslint差不多，感兴趣的小伙伴可以看一下我的另外一篇文章[babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257)

比如我们上一节的demo项目中的demo1.js:

```js
document.write("hello eslint");
```

变成抽象语法树是这样的：

![](/Users/ocj1/WebstormProjects/Study/eslint-demo/demo1.ast.png)

感兴趣的小伙伴可以自己去ast在线转换里面测试：https://astexplorer.net/

那么我们怎么遍历这个ast对象呢？ 接下来就是我们的traverse上场了，traverse就是专门用来遍历ast对象的。

## traverse

我们回到之前的runRules方法，在runRules中我看到了这么一段代码，

lib/linter/linter.js：

```js
//创建ast语法树遍历器 
Traverser.traverse(sourceCode.ast, {
        enter(node, parent) {
            node.parent = parent;
            nodeQueue.push({ isEntering: true, node });
        },
        leave(node) {
            nodeQueue.push({ isEntering: false, node });
        },
        visitorKeys: sourceCode.visitorKeys
    });
```

Traverser.traverse方法就是创建了一个ast解析器，去解析ast对象。

lib/shared/traverser.js：

```js
traverse(node, options) {
        this._current = null;
        this._parents = [];
        this._skipped = false;
        this._broken = false;
        this._visitorKeys = options.visitorKeys || vk.KEYS;
        this._enter = options.enter || noop;
        this._leave = options.leave || noop;
        this._traverse(node, null);
    }

    /**
     * Traverse the given AST tree recursively.
     * @param {ASTNode} node The current node.
     * @param {ASTNode|null} parent The parent node.
     * @returns {void}
     * @private
     */
    _traverse(node, parent) {
        if (!isNode(node)) {
            return;
        }

        this._current = node;
        this._skipped = false;
        this._enter(node, parent);

        if (!this._skipped && !this._broken) {
            const keys = getVisitorKeys(this._visitorKeys, node);

            if (keys.length >= 1) {
                this._parents.push(node);
                for (let i = 0; i < keys.length && !this._broken; ++i) {
                    const child = node[keys[i]];

                    if (Array.isArray(child)) {
                        for (let j = 0; j < child.length && !this._broken; ++j) {
                            this._traverse(child[j], node);
                        }
                    } else {
                        this._traverse(child, node);
                    }
                }
                this._parents.pop();
            }
        }

        if (!this._broken) {
            this._leave(node, parent);
        }

        this._current = parent;
    }
```

在_traverse方法中我们可以看到，其实就是在递归遍历我们的ast的节点，那么每个节点到底是什么呢？

以我们的demo1.js为例子：

```js
document.write("hello eslint");
```

变成抽象语法树是这样的：

![](/Users/ocj1/WebstormProjects/Study/eslint-demo/demo1.ast.png)

那么traverser怎么知道遍历哪些字段呢？ 通过上面的demo1.js的ast对象我们可以看到一个叫type的属性，type值为“program”，在_traserve方法中我看到这么一段代码：

```js
//获取可以遍历的属性keys  
const keys = getVisitorKeys(this._visitorKeys, node);
            if (keys.length >= 1) {
                this._parents.push(node);
              //遍历每一个key
                for (let i = 0; i < keys.length && !this._broken; ++i) {
                    const child = node[keys[i]];
							
                    if (Array.isArray(child)) {
                        for (let j = 0; j < child.length && !this._broken; ++j) {
                          //递归遍历key
                            this._traverse(child[j], node);
                        }
                    } else {
                      //递归遍历key
                        this._traverse(child, node);
                    }
                }
                this._parents.pop();
            }
```

那么上面的keys从哪来呢？我们找到这么一个文件，

xxx/node_modules/eslint-visitor-keys/lib/visitor-keys.json:

```js
{
  ...
  "Program": [
        "body"
    ]
  ...
}
```

内容有点多了，我们直接看我们demo.js需要的type值“Program”，也就是如果当前节点的type为“Program“的话，就会遍历body值，然后重复递归直到结束。

每次遍历一个节点的时候会调用_enter方法，然后离开当前节点的时候会调用_leave方法。

现在再来看这段代码是不是就清晰多了呢？

lib/linter/linter.js：

```js
//创建ast语法树遍历器 
Traverser.traverse(sourceCode.ast, {
        enter(node, parent) {
            node.parent = parent;
            nodeQueue.push({ isEntering: true, node });
        },
        leave(node) {
            nodeQueue.push({ isEntering: false, node });
        },
        visitorKeys: sourceCode.visitorKeys
    });
```

那么traverse怎么执行每个rule方法的呢？

## 执行rule

我们回到runRules方法

lib/linter/linter.js：

```js
function runRules(sourceCode, configuredRules, ruleMapper, parserOptions, parserName, settings, filename, disableFixes, cwd) {
    const emitter = createEmitter();
    const nodeQueue = [];
    let currentNode = sourceCode.ast;

    Traverser.traverse(sourceCode.ast, {
        enter(node, parent) {
            node.parent = parent;
            nodeQueue.push({ isEntering: true, node });
        },
        leave(node) {
            nodeQueue.push({ isEntering: false, node });
        },
        visitorKeys: sourceCode.visitorKeys
    });

    /*
     * Create a frozen object with the ruleContext properties and methods that are shared by all rules.
     * All rule contexts will inherit from this object. This avoids the performance penalty of copying all the
     * properties once for each rule.
     */
    const sharedTraversalContext = Object.freeze(
        Object.assign(
            Object.create(BASE_TRAVERSAL_CONTEXT),
            {
                getAncestors: () => getAncestors(currentNode),
                getDeclaredVariables: sourceCode.scopeManager.getDeclaredVariables.bind(sourceCode.scopeManager),
                getCwd: () => cwd,
                getFilename: () => filename,
                getScope: () => getScope(sourceCode.scopeManager, currentNode),
                getSourceCode: () => sourceCode,
                markVariableAsUsed: name => markVariableAsUsed(sourceCode.scopeManager, currentNode, parserOptions, name),
                parserOptions,
                parserPath: parserName,
                parserServices: sourceCode.parserServices,
                settings
            }
        )
    );


    const lintingProblems = [];

    Object.keys(configuredRules).forEach(ruleId => {
        const severity = ConfigOps.getRuleSeverity(configuredRules[ruleId]);

        // not load disabled rules
        if (severity === 0) {
            return;
        }

        const rule = ruleMapper(ruleId);

        if (rule === null) {
            lintingProblems.push(createLintingProblem({ ruleId }));
            return;
        }

        const messageIds = rule.meta && rule.meta.messages;
        let reportTranslator = null;
        const ruleContext = Object.freeze(
            Object.assign(
                Object.create(sharedTraversalContext),
                {
                    id: ruleId,
                    options: getRuleOptions(configuredRules[ruleId]),
                    report(...args) {

                        /*
                         * Create a report translator lazily.
                         * In a vast majority of cases, any given rule reports zero errors on a given
                         * piece of code. Creating a translator lazily avoids the performance cost of
                         * creating a new translator function for each rule that usually doesn't get
                         * called.
                         *
                         * Using lazy report translators improves end-to-end performance by about 3%
                         * with Node 8.4.0.
                         */
                        if (reportTranslator === null) {
                            reportTranslator = createReportTranslator({
                                ruleId,
                                severity,
                                sourceCode,
                                messageIds,
                                disableFixes
                            });
                        }
                        const problem = reportTranslator(...args);

                        if (problem.fix && rule.meta && !rule.meta.fixable) {
                            throw new Error("Fixable rules should export a `meta.fixable` property.");
                        }
                        lintingProblems.push(problem);
                    }
                }
            )
        );

        const ruleListeners = createRuleListeners(rule, ruleContext);

        // add all the selectors from the rule as listeners
        Object.keys(ruleListeners).forEach(selector => {
            emitter.on(
                selector,
                timing.enabled
                    ? timing.time(ruleId, ruleListeners[selector])
                    : ruleListeners[selector]
            );
        });
    });

    // only run code path analyzer if the top level node is "Program", skip otherwise
    const eventGenerator = nodeQueue[0].node.type === "Program" ? new CodePathAnalyzer(new NodeEventGenerator(emitter)) : new NodeEventGenerator(emitter);

    nodeQueue.forEach(traversalInfo => {
        currentNode = traversalInfo.node;

        try {
            if (traversalInfo.isEntering) {
                eventGenerator.enterNode(currentNode);
            } else {
                eventGenerator.leaveNode(currentNode);
            }
        } catch (err) {
            err.currentNode = currentNode;
            throw err;
        }
    });

    return lintingProblems;
}

```

代码我直接全部贴过来了，我们首先看到：

```js
 Traverser.traverse(sourceCode.ast, {
        enter(node, parent) {
            node.parent = parent;
            nodeQueue.push({ isEntering: true, node });
        },
        leave(node) {
            nodeQueue.push({ isEntering: false, node });
        },
        visitorKeys: sourceCode.visitorKeys
    });
```

这个我们上面解析过了，就是创建一个ast遍历器，可以看到把每个ast的节点对象装进了一个叫nodeQueue数组中，

接下来就是创建每一个rule对象了，然后执行rule对象的create方法。

```js
...
//遍历每条rule规则
    Object.keys(configuredRules).forEach(ruleId => {
        const severity = ConfigOps.getRuleSeverity(configuredRules[ruleId]);

        // not load disabled rules
        if (severity === 0) {
            return;
        }

        const rule = ruleMapper(ruleId);

        if (rule === null) {
            lintingProblems.push(createLintingProblem({ ruleId }));
            return;
        }

        const messageIds = rule.meta && rule.meta.messages;
        let reportTranslator = null;
        const ruleContext = Object.freeze(
            Object.assign(
                Object.create(sharedTraversalContext),
                {
                    id: ruleId,
                    options: getRuleOptions(configuredRules[ruleId]),
                    report(...args) {
...
                        if (reportTranslator === null) {
                            reportTranslator = createReportTranslator({
                                ruleId,
                                severity,
                                sourceCode,
                                messageIds,
                                disableFixes
                            });
                        }
                        const problem = reportTranslator(...args);

                        if (problem.fix && rule.meta && !rule.meta.fixable) {
                            throw new Error("Fixable rules should export a `meta.fixable` property.");
                        }
                        lintingProblems.push(problem);
                    }
                }
            )
        );
				//创建一个rule对象
        const ruleListeners = createRuleListeners(rule, ruleContext);

```

createRuleListeners方法

lib/linter/linter.js:

```js
function createRuleListeners(rule, ruleContext) {
    try {
        return rule.create(ruleContext);
    } catch (ex) {
        ex.message = `Error while loading rule '${ruleContext.id}': ${ex.message}`;
        throw ex;
    }
}
```

很简单，也就是调用了每个规则的create方法，那么create方法返回的又是什么呢？其实就是我们的ast的每个节点类型，travese已经拿到了ast的每个节点，然后遍历节点的时候就去rule里面找，一个个找rule问，你是否需要处理呢？

我们随便找一个eslint内置rule看看，

lib/rules/semi.js：

```js
module.exports = { 
  ...
 create(ruleContext){
    return {
              VariableDeclaration: checkForSemicolonForVariableDeclaration,
              ExpressionStatement: checkForSemicolon,
              ReturnStatement: checkForSemicolon,
              ThrowStatement: checkForSemicolon,
              DoWhileStatement: checkForSemicolon,
              DebuggerStatement: checkForSemicolon,
              BreakStatement: checkForSemicolon,
              ContinueStatement: checkForSemicolon,
              ImportDeclaration: checkForSemicolon,
              ExportAllDeclaration: checkForSemicolon,
              ExportNamedDeclaration(node) {
                  if (!node.declaration) {
                      checkForSemicolon(node);
                  }
              },
              ExportDefaultDeclaration(node) {
                  if (!/(?:Class|Function)Declaration/u.test(node.declaration.type)) {
                      checkForSemicolon(node);
                  }
              }
          };
 	}
  ...
}
```

在看一下我们demo1.js的ast图：

![](/Users/ocj1/WebstormProjects/Study/eslint-demo/demo1.ast.png)

可以看到，当traverse遍历到ExpressionStatement节点的时候，就会触发semi规则的ExpressionStatement节点回调函数

checkForSemicolon方法，然后semi根据自己的rule处理代码，最后通过ruleContext的report方法报告给eslint，eslint收集每个rule的返回值。



## postprocess？

我们继续回到我们的_verifyWithProcessor方法，

lib/linter/linter.js：

```js
 _verifyWithProcessor(textOrSourceCode, config, options, configForRecursive) {
        	...
           const postprocess = options.postprocess || lodash.flatten;
   				...
            const messageLists = preprocess(text, filenameToExpose).map((block, i) => {
           ...
            // Does lint.
            return this._verifyWithoutProcessors(
                blockText,
                config,
                { ...options, filename: blockName }
            );
        });
				//执行配置文件的postprocess方法
        return postprocess(messageLists, filenameToExpose);
    }
```

可以看到，当rule处理完毕代码后，就直接把处理完毕的结果给了postprocess方法，所以我们可以在postprocess方法中对rule处理的结果进行处理。

## 返回lintingProblems

rule处理完毕后返回lintingProblems结果给linter

lib/linter/linter.js

```js
verifyAndFix(text, config, options) {

         	...
            messages = this.verify(currentText, config, options);
						...
    }
```

## fix?

如果需要修复代码的话，那么就调用SourceCodeFixer.applyFixes

lib/linter/linter.js

```js
verifyAndFix(text, config, options) {
  	...
 							messages = this.verify(currentText, config, options);
  	...
            fixedResult = SourceCodeFixer.applyFixes(currentText, messages, shouldFix);
    }
```

lib/linter/source-code-fixer.js：

```js
SourceCodeFixer.applyFixes = function(sourceText, messages, shouldFix) {
    debug("Applying fixes");

    if (shouldFix === false) {
        debug("shouldFix parameter was false, not attempting fixes");
        return {
            fixed: false,
            messages,
            output: sourceText
        };
    }

    // clone the array
    const remainingMessages = [],
        fixes = [],
        bom = sourceText.startsWith(BOM) ? BOM : "",
        text = bom ? sourceText.slice(1) : sourceText;
    let lastPos = Number.NEGATIVE_INFINITY,
        output = bom;

    /**
     * Try to use the 'fix' from a problem.
     * @param   {Message} problem The message object to apply fixes from
     * @returns {boolean}         Whether fix was successfully applied
     */
    function attemptFix(problem) {
        const fix = problem.fix;
        const start = fix.range[0];
        const end = fix.range[1];

        // Remain it as a problem if it's overlapped or it's a negative range
        if (lastPos >= start || start > end) {
            remainingMessages.push(problem);
            return false;
        }

        // Remove BOM.
        if ((start < 0 && end >= 0) || (start === 0 && fix.text.startsWith(BOM))) {
            output = "";
        }

        // Make output to this fix.
        output += text.slice(Math.max(0, lastPos), Math.max(0, start));
        output += fix.text;
        lastPos = end;
        return true;
    }

    messages.forEach(problem => {
        if (Object.prototype.hasOwnProperty.call(problem, "fix")) {
            fixes.push(problem);
        } else {
            remainingMessages.push(problem);
        }
    });

    if (fixes.length) {
        debug("Found fixes to apply");
        let fixesWereApplied = false;

        for (const problem of fixes.sort(compareMessagesByFixRange)) {
            if (typeof shouldFix !== "function" || shouldFix(problem)) {
                attemptFix(problem);

                /*
                 * The only time attemptFix will fail is if a previous fix was
                 * applied which conflicts with it.  So we can mark this as true.
                 */
                fixesWereApplied = true;
            } else {
                remainingMessages.push(problem);
            }
        }
        output += text.slice(Math.max(0, lastPos));

        return {
            fixed: fixesWereApplied,
            messages: remainingMessages.sort(compareMessagesByLocation),
            output
        };
    }

    debug("No fixes to apply");
    return {
        fixed: false,
        messages,
        output: bom + text
    };

};

```

每个rule除了提供了校验ast的回调函数外，还提供了fix方法供eslint修复代码，比如semi.js:

```js
 fix = function(fixer) {
                    return fixer.insertTextAfter(lastToken, ";");
                };

                fix = function(fixer) {

                    /*
                     * Expand the replacement range to include the surrounding
                     * tokens to avoid conflicting with no-extra-semi.
                     * https://github.com/eslint/eslint/issues/7928
                     */
                    return new FixTracker(fixer, sourceCode)
                        .retainSurroundingTokens(lastToken)
                        .remove(lastToken);
                };
```

semi规则会告诉eslint你需要添加或者移除“;”符号。

## 修复文件

好啦，rule处理完毕了，fix的结果我们也拿到了，现在需要把fixedResult重新写入文件。

lib/cli.js：

```js

        if (options.fix) {
            debug("Fix mode enabled - applying fixes");
            await ESLint.outputFixes(results);
        }
```

```js
static async outputFixes(results) {
        if (!Array.isArray(results)) {
            throw new Error("'results' must be an array");
        }

        await Promise.all(
            results
                .filter(result => {
                    if (typeof result !== "object" || result === null) {
                        throw new Error("'results' must include only objects");
                    }
                    return (
                        typeof result.output === "string" &&
                        path.isAbsolute(result.filePath)
                    );
                })
                .map(r => writeFile(r.filePath, r.output))
        );
    }
```

很简单，也就是文件的读写修改操作。

好啦～ 整个eslint的源码我们跟着流程图简单的走了一遍，当然，深入研究eslint的话绝对不止我们这一点点内容，一个parser就够我们玩了，感兴趣的小伙伴可以自己去看看哦，写这篇文章的目的也是为后面我们自定义plugin做铺垫，只有知根知底方能百战百胜，下节见！！