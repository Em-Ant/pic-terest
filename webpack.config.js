const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-source-map',
  entry: path.join(__dirname, 'client', 'components', 'index.jsx'),
  output: {
    path: path.join(__dirname, 'client', 'public', 'static'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};
