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