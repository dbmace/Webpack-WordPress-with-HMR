//import all necessary files and configurations
const path = require('path');
const webpack = require('webpack');
const browserSync = require('browser-sync').create();

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleare');

const { publicFolder, proxyTarget, watch } = require('./config');
const webpackConfig = require('./webpack.config')({ dev: true });
const getPublicPath = require('./publicPath');

//instantiate compiler with config
const compiler = webpack(webpackConfig);

//create array of middlewares for BrowserSync
//logging disabled because friendly errors will handle it
const middleware = [
  webpackDevMidleware(compiler, {
    publicPath: getPublicPath(publicFolder),
    logLevel: 'silent',
    quiet: true
  },
  webpackHotMiddleware(compiler, {
    log: false,
    logLevel: 'none'
  }
]

//intialize BrowserSync

browserSync.init({
  middleware,
  proxy: {
    target: proxyTarget,
    middleware
  },
  logLevel: 'silent',
  files: watch.map(element => path.resolve(element)),
  snippetOptions: {
    rule: {
      match: /<\/head>/i,
      fn: function(snippet, match) {
        return `<script src="${getPublicPath(publicFolder)}"></script>${snippet}${match}`;
      }
    }
  }
});
