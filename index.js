'use strict';

require('babel/register')({
  // prevent issues with global installs
  // and babel ignoring any occurrence of
  // 'node_modules' by default.
  ignore: false,
  only: new RegExp(`${__dirname}\/lib\/`)
});

module.exports = require('./lib');
