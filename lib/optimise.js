'use strict';

import sharp from 'sharp';

function optimise(opts) {
  let transforms = sharp()
    .progressive()
    .rotate()
    .withoutEnlargement()
    .quality(parseInt(opts.q))
    .compressionLevel(9)
    .sequentialRead()
    .resize(parseInt(opts.w), parseInt(opts.h));

  if (opts.fit !== 'crop') {
    transforms.max();
  }
  console.log(opts.fm);
  transforms.toFormat(opts.fm);

  return transforms;
}

export default optimise;
