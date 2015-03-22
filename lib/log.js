'use strict';

import dbg from 'debug';
const debug = dbg('imgop');

function log(...args) {
  args[0] = `${new Date} – ${args[0]}`;
  debug(...args);
}

export default log;
