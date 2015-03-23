'use strict';

import http from 'http';
import koa from 'koa';
import responseTime from 'koa-response-time';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import qs from 'koa-qs';
import onRequest from './on-request';

let env = process.env.NODE_ENV || 'development';

function imgop() {
  let app = koa();

  middleware(app);
  app.use(onError);
  app.use(onRequest);

  let server = http.createServer(app.callback());

  return server;
}

export default imgop;

/**
 * Middleware
 */

function middleware(app) {
  // X-Response-Time
  app.use(responseTime());

  // development style logging
  if ('development' === env)
    app.use(logger());

  // error handling
  onerror(app);

  // nested query string
  qs(app);
}


/**
 * Handle error.
 */

function* onError(next) {
  try {
    yield next;
  } catch (err) {
    if ('NoSuchKey' === err.code) {
      err.status = 404;
    }
    if (err.status !== 415 && err.status !== 404) {
      throw err;
    }
    this.status = err.status;
  }
}
