'use strict';

import koa from 'koa';
import http from 'http';
import middleware from './middleware';
import onRequest from './on-request';

let app = koa();

middleware(app);
app.use(onError);
app.use(onRequest);

let port = process.env.PORT || 3000;

let server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`listening on ${port}`);
});

/**
 * Handle error.
 */

function* onError(next) {
  try {
    yield next;
  } catch (err) {
    if (err.status !== 415 && err.status !== 404) {
      throw err;
    }
    this.status = err.status;
  }
}
