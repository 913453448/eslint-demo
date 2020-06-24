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
        //获取规则中配置的第一个参数
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