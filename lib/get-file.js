'use strict';

import dbg from 'debug';
import S3 from './s3';
import cache from './cache';
import error from './errors';
import log from './log';

let debug = dbg('imgop:get-file');
let s3 = S3();

log(`tmpdir – ${cache.tmpdir}`);

/**
 * Get the filename of an image by key.
 * If it does not exist, get it from s3.
 */

// retrievals in progress
let progress = Object.create(null);

function getFile(key) {
  if (progress[key]) return progress[key];

  return cache.access(key).then(filename => {
    if (filename) return filename;

    log(`${key} – cache miss`);

    let stream = s3.getObject({ Key: key }).createReadStream();

    progress[key] = cache.copy(key, stream)
      .then(filename => {
        delete progress[key];
        return filename;
      })
      .catch(err => {
        delete progress[key];
        throw err;
      });

    return progress[key];
  });
}

export default getFile;
