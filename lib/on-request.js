'use strict';

import Debug from 'debug';
import S3 from 'knox';
import pipe from 'multipipe';
import extend from 'xtend';
import fs from 'fs';
import { supported, query, s3 } from './options';
import cache from './cache';
import optimise from './optimise';
import error from './errors';

let debug = Debug('imgop:on-request');
let client = S3.createClient(s3);

function* onRequest() {
  if ('GET' !== this.method) return;

  let key = this.path.substring(1);

  if('favicon.ico' === key || '' === key) return;

  let typeMatch = key.match(/\.([^.]*)$/);
  let imageType = typeMatch ? typeMatch[1] : '';

  if (!typeMatch || !~supported.indexOf(imageType)) {
    throw error('unsupported-input-format');
  }

  let opts = this.query;
  opts = extend(query, opts);
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
    client.getFile(key, (err, res) => {
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
