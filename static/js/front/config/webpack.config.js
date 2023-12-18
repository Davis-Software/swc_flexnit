const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


let devMode = true

module.exports = {
    mode: devMode ? "development" : "production",
    watch: devMode,
    // watchOptions: {
    //     poll: 500
    // },

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
            minify: !devMode
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "server",
            openAnalyzer: true
        })
    ],

    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },

    devtool: devMode ? "source-map" : undefined
}