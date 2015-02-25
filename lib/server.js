'use strict';

import http from 'http';
import app from './';

let server = http.createServer(app.callback());

if (process.env.NODE_ENV !== 'test') {
  let port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`imgop listening on ${port}`);
  });
}

export default server;
