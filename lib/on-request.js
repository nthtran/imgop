'use strict';

import Debug from 'debug';
import S3 from 'knox';
import pipe from 'multipipe';
import extend from 'xtend';
import fs from 'fs';
import cache from './cache';
import optimise from './optimise';
import error from './errors';

let debug = Debug('imgop:on-request');
let supported = ['jpg', 'jpeg', 'png', 'webp'];
let options = {
  w: null,
  h: null,
  q: 80, // default `libvips` value
  fit: 'max',
  fm: 'jpg'
};

let env = process.env;
let s3 = S3.createClient({
  key: env.AWS_ACCESS_KEY_ID,
  secret: env.AWS_SECRET_ACCESS_KEY,
  bucket: env.IMGOP_BUCKET
});

function* onRequest() {
  let key = this.path.substring(1);

  if('favicon.ico' === key) return;

  if ('' === key) {
    this.type = 'text/plain; charset=utf-8';
    this.body = '(ノಠ益ಠ)ノ彡┻━┻';
    return;
  }

  let typeMatch = key.match(/\.([^.]*)$/);
  let imageType = typeMatch ? typeMatch[1] : '';

  if (!typeMatch || !~supported.indexOf(imageType)) {
    throw error('unsupported-input-format');
  }

  let opts = this.query;
  opts = extend(options, opts);
  // convert to a format `libvips` understands
  if ('jpg' === opts.fm) opts.fm = 'jpeg';
  // default is `jpeg`
  if (opts.fm !== 'jpeg' && opts.fm !== 'png' && opts.fm !== 'webp') {
    opts.fm = 'jpeg';
  }

  let fileStream = fs.createReadStream(yield getFile(key));
  // optimise file
  let stream = pipe(fileStream, optimise(opts));
  stream.on('error', err => {
    throw err;
  });

  this.type = `image/${opts.fm}`;
  this.body = stream;
}

export default onRequest;

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

    return progress[key] = download(key)
      .then(res => {
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
  });
}

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
