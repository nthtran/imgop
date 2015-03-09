'use strict';

import sharp from 'sharp';
import extend from 'xtend';

export let inputs = ['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff'];
export let outputs = ['jpg', 'png', 'webp'];

let options = {
  w: null,
  h: null,
  q: 80, // default `libvips` value
  fit: 'max',
  fm: 'jpg'
};


function optimise(opts) {
  opts = opts || {};
  opts = extend(options, opts);
  // convert to `jpeg` which is what `libvips` uses
  // and default to `jpeg` if `fm` is not supported
  if ('jpg' === opts.fm || !~outputs.indexOf(opts.fm))
    opts.fm = 'jpeg';

  let q = getNumber('q', opts);
  let w = getNumber('w', opts);
  let h = getNumber('h', opts);
  let fit = opts.fit;
  let fm = opts.fm;

  let transforms = sharp()
    .progressive()
    .rotate()
    .withoutEnlargement()
    .quality(parseInt(q))
    .compressionLevel(9)
    .sequentialRead()
    .resize(parseInt(w), parseInt(h));

  if (fit !== 'crop') {
    transforms.max();
  }

  transforms.toFormat(fm);

  return { transforms, fm };
}

export default optimise;

function getNumber(key, obj) {
  let ret = Number(obj[key]);
  return Number.isNaN(ret) ? options[key] : ret;
}
