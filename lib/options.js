'use strict';

let env = process.env;

export let supported = ['jpg', 'jpeg', 'png', 'webp'];

export let query = {
  w: null,
  h: null,
  q: 80, // default `libvips` value
  fit: 'max',
  fm: 'jpg'
};

export let s3 = {
  key: env.AWS_ACCESS_KEY_ID,
  secret: env.AWS_SECRET_ACCESS_KEY,
  bucket: env.IMGOP_BUCKET
};
