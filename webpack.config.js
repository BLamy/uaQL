import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');



const path = require('path');

module.exports = {
  context: __dirname,                                   // input path
  devtool: 'inline-source-map',
  
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, 'js', 'app.js')
  ],
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json'],  // along the way, subsequent file(s) to be consumed by webpack
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },
  
  plugins: [
    new ExtractTextPlugin('example.css', { allChunks: true }),  // compiled css (single file only)
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
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
  output: {
    filename: 'app.js', 
    path: '/',
    publicPath: '/js/'}
};




var whatever =  {
  context: __dirname,                                   // input path
  devtool: 'inline-source-map',
  entry: [                                              // webpack will start consuming from these file(s)
    'webpack-hot-middleware/client',
    './app/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),                // output path
    filename: 'example.js',                             // compiled js (single file only)
    publicPath: '/'
  },
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json'],  // along the way, subsequent file(s) to be consumed by webpack
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },
  module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
           presets:['es2015','react']
        }
      }, {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap')
      }
    ]
  },
  postcss: [autoprefixer],
  plugins: [
    new ExtractTextPlugin('example.css', { allChunks: true }),  // compiled css (single file only)
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
};