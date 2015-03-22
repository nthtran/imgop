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
    let start = Date.now();

    progress[key] = download(key)
      .then(res => {
        log(`${key} – downloaded in ${Date.now() - start}ms`);
        return cache.copy(key, res);
      })
      .then(filename => {
        progress[key] = undefined;
        return filename;
      })
      .catch(err => {
        progress[key] = undefined;
        throw err;
      });

    return progress[key];
  });
}

export default getFile;

/**
 * Download an image from s3 by key
 */

function download(key) {
  return new Promise((resolve, reject) => {
    s3.getFile(key, (err, res) => {
      if (err) return reject(err);

      debug(`store: got status code ${res.statusCode} from ${key}`);

      if (res.statusCode !== 200) {
        res.resume();
        reject(error('image-source-not-found'));
        return;
      }

      resolve(res);
    });
  });
}
