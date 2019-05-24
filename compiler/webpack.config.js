const path = require('path');
const webpack = require('webpack');

const MiniCssExtractWebpackPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const NonJsEntryCleanupPlugin = require('./non-js-entry-cleanup-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const { context, entry, devtool, outputFolder, publicFolder } = require('./config');

const HMR = require('./hmr');
const getPublicPath = require('./publicPath');

module.exports = (options) => {
  const { dev } = options;
  const hmr = HMR.getClient();
  return {
    //set webpackmode depending on dev variable
    mode: dev ? 'development' : 'production',
    //if in dev mode, create source maps for easier debugging
    devtool: dev ? devtool : false,
    //context must be an absolute path, so we resolve it with the ocntext folder in config.js
    context: path.resolve(context),
    //entry for styles and scripts.  If in dev mode, add HMR client to watch for changes and autoreload.  Creates subfolders for output files.
    entry: {
      'styles/main': dev ? [hmr, entry.styles] : entry.styles,
      'scripts/main': dev ? [hmr, entry.scripts] : entry.scripts
    },
    //Use settings from config.js for output locations.  [name].js uses entry name as filename.
    output: {
      path: path.resolve(outputFolder),
      publicPath: getPublicPath(publicFolder),
      filename: '[name].js'
    },
    //Put loaders into rules to handle various file types.  For our purposes, we handle JS, SCSS, CSS, and common file types for images, videos, fonts, etc.
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            ...(dev ? [{ loader: 'cache-loader' }] : []),
            { loader: 'babel-loader' }
          ]
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            ...(dev ? [{ loader: 'cache-loader' }, { loader: 'style-loader, options: { sourceMap: dev } }] : [ MiniCssExtractWebpackPlugin.loader ]),
            { loader: 'css-loader', options: { sourceMap: dev } },
            { loader: 'postcss-loader', options: {
              ident: 'postcss',
              sourceMap: dev,
              config: { ctx: { dev } }
            } },
            { loader: 'resolve-url-loader', options: { sourceMap: dev } },
            { loader: 'sass-loader', options: { sourceMap: true, sourceMapContents: dev } }
          ]
        },
        {
          test: /\.(ttf|otf|eot|woff2?|png|jpe?g|gif|svg|ico|mp4|webm)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              }
            }
          ]
        },
      ]
    },
    //Plugins modify files before compiling/emitting.  Handle HMR, write pretty errors, extract css from JS bundles, clean prod folder and copy files.  Mostly used for production.
    plugins: [
      ...(dev ? [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsWebpackPlugin()
      ] : [
        new MiniCssExtractWebpackPlugin({
          filename: '[name].css'
        }),
        new NonJsEntryCleanupPlugin({
          context: 'styles',
          extesion: 'js',
          includeSubfolders: true
        }),
        new CopyWebpackPlugin([
          path.resolve(outputFolder)
        ], {
          allowExternal: true,
          beforeEmit: true
        }),
        new CopyWebpackPlugin([
          {
            from: path.resolve(`${context}/**/*`),
            to: path.resolve(outputFolder),
          }
        ], {
          ignore: ['*.js', '*.scss', '*.css']
        })
      ])
    ]
  };
}
