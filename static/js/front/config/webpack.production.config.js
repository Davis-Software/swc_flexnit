const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: "./src",

    plugins: [
        new HtmlWebpackPlugin({
            publicPath: "/static/js/pages",
            scriptLoading: "blocking",
            template: __dirname + "/../../../../../templates/pages/index.template.html",
            filename: __dirname + "/../../../../../templates/pages/index.html",
            inject: false,
            minify: true
        })
    ],

    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/../../../pages",
        clean: {
            keep: /index_src/
        }
    },

    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules$/
            }
        ]
    },

    optimization: {
        splitChunks: {
            chunks: "all"
        }
    }
}