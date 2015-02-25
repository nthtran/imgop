'use strict';

require('babel/register')({
  // don't compile external deps
  ignore: new RegExp(`${__dirname}\/node_modules`)
});

require('./lib');
