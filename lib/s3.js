'use strict';

import S3 from 'knox';

let env = process.env;
function createClient() {
  return S3.createClient({
    key: env.AWS_ACCESS_KEY_ID,
    secret: env.AWS_SECRET_ACCESS_KEY,
    bucket: env.IMGOP_BUCKET
  });
}

export default createClient;
