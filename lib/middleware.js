'use strict';

import responseTime from 'koa-response-time';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import qs from 'koa-qs';

let env = process.env.NODE_ENV || 'development';

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

export default middleware;
