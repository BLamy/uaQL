path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const webpack = require('webpack');
module.exports = {
  entry: path.resolve(__dirname, 'js', 'app.js'),
    plugins: [
      new ExtractTextPlugin('example.css', { allChunks: true }),  // compiled css (single file only)
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
    ],
    module: {
      loaders: [
        {
          test: /(\.js|\.jsx)$/,
          exclude: /(node_modules)/,
          loaders: ['react-hot', 'babel'],
          //query: {
          //   presets:['es2015','react']
          //}
        }, {
          test: /(\.scss|\.css)$/,
          loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap')
        }
      ]
    },
    postcss: [autoprefixer],
    output: {filename: 'app.js', path: 'build2/js'}
};