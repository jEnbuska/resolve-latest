const MinifyPlugin = require('babel-minify-webpack-plugin');
const path = require('path');

const src = path.join(__dirname, 'src');
const root = path.resolve();

module.exports = {
    context: src,
    entry: {
        index: `${src}/index.js`
    },
    output: {
        path: root,
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                },
            },
        ],
    },
    plugins: [
        new MinifyPlugin(),
    ],
};
