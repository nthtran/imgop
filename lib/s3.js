'use strict';

import AWS from 'aws-sdk';

function createClient() {
  return new AWS.S3({
    params: { Bucket: process.env.IMGOP_BUCKET }
  });
}

export default createClient;
