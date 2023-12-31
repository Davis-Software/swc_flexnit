const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "production",
    entry: "./src/index.tsx",

    output: {
        path: __dirname + "/../../bundle",
        filename: "[name].bundle.js",
        chunkFilename: "[id].chunk.js",
        clean: true
    },

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "babel-loader",
                exclude: /node_modules$/
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            publicPath: "/static/js/bundle",
            scriptLoading: "blocking",
            template: __dirname + "/../../../../templates/pages/index.template.html",
            filename: __dirname + "/../../../../templates/pages/index.html",
            inject: false,
            minify: true
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: true
        })
    ],

    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    }
}