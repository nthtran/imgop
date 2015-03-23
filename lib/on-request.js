'use strict';

import fs from 'fs';
import mime from 'mime-types';
import getFile from './get-file';
import optimise, { inputs } from './optimise';
import error from './errors';

function* onRequest() {
  if ('GET' !== this.method) return;

  let key = this.path.substring(1);

  if('favicon.ico' === key || '' === key) return;

  let typeMatch = key.match(/\.([^.]*)$/);
  let imageType = typeMatch ? typeMatch[1] : '';
  if (!typeMatch || !~inputs.indexOf(imageType)) {
    throw error('unsupported-input-format');
  }

  // optimise file
  let filename = yield getFile(key);
  let opts = this.query;
  let { transforms, fm } = optimise(filename, opts);

  this.type = mime.contentType(fm);
  this.body = transforms;
}

export default onRequest;
