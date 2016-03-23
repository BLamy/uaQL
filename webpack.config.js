import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';


var path = require('path');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, 'js', 'app.js')
  ],
  plugins: [
    //new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    //new webpack.NoErrorsPlugin(),
  ],
  module: {
      loaders: [
        {
          exclude: /node_modules/,
          loaders: ['react-hot', 'babel'],
          test: /\.js$/,
        }
      ]
    },
  output: {
    filename: 'app.js', 
    path: '/',
    publicPath: '/js/'}
};

