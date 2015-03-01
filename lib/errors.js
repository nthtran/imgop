'use strict';

import dbg from 'debug';
import error from 'http-errors';

let debug = dbg('imgop:errors');

function errors(key) {
  let opts = errors[key];

  if (!opts) return debug('no error by code %s', key);

  let err = error(opts.status || 400, opts.message);
  err.key = err.code = key;
  return err;
}

export default errors;

errors['image-source-not-found'] = {
  message: 'Image not found in S3.',
  status: 404
};

errors['unsupported-input-format'] = {
  message: 'This image\'s format is not supported.',
  status: 415
};
