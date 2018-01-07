'use strict';

const killable = require('killable');
const Koa = require('koa');
const serveStatic = require('koa-static');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotClient = require('../');
const config = require('./fixtures/webpack.config.js');

const app = new Koa();
const server = app.listen(8080, 'localhost');
const compiler = webpack(config);

function koaDevware() {
  const dev = devMiddleware(compiler, { publicPath: '/' });

  function waitMiddleware() {
    return new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        resolve(true);
      });

      compiler.plugin('failed', (error) => {
        reject(error);
      });
    });
  }

  return async (context, next) => {
    await waitMiddleware();
    await new Promise((resolve) => {
      dev(context.req, {
        end: (content) => {
          context.body = content; // eslint-disable-line no-param-reassign
          resolve();
        },
        setHeader: context.set.bind(context),
        locals: context.state
      }, () => resolve(next()));
    });
  };
}

module.exports = () => {
  const result = hotClient(compiler, { hot: false, test: true });

  app.use(serveStatic(config.context));
  app.use(koaDevware());

  killable(server);

  server.on('error', (err) => {
    console.log('Server Error', err); // eslint-disable-line no-console
  });

  process.on('exit', () => {
    server.kill();
  });

  return result;
};
