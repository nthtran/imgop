'use strict';

let path = require('path');
let fs = require('fs');
let assert = require('assert');
let imageSize = require('image-size');
let server = require('..')().listen();
let request = require('supertest').agent(server);
let S3 = require('knox');

let env = process.env;
let s3 = S3.createClient({
  key: env.AWS_ACCESS_KEY_ID,
  secret: env.AWS_SECRET_ACCESS_KEY,
  bucket: env.IMGOP_BUCKET
});

let key = '/input.jpg';
let file = path.resolve('.', `test/fixtures${key}`);

// upload a test image first
before(function (done) {
  this.timeout(20000);

  s3.headFile(key, checkExists);

  function checkExists(err, res) {
    if (err) done(err);

    if (res.statusCode !== 200) {
      fs.stat(file, upload);
    } else {
      done(null, res);
    }
  }

  function upload(err, stat) {
    if (err) done(err);
    s3.putStream(fs.createReadStream(file), key, {
      'Content-Length': stat.size,
      'Content-Type': 'image/jpeg'
    }, done);
  }
});

describe('GET /:image', function () {
  this.timeout(20000);

  let baseImage;

  it('should allow only GET requests', function (done) {
    request.post('/')
    .expect(404)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Not Found');
      done();
    });
  });

  it('should not serve \'favicon.ico\'', function (done) {
    request.get('/favicon.ico')
    .expect(404)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Not Found');
      done();
    });
  });

  it('should not serve \'/\'', function (done) {
    request.get('/')
    .expect(404)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Not Found');
      done();
    });
  });

  it('should not serve non-existing files', function (done) {
    request.get('/this-filedoes-not-exist.jpg')
    .expect(404)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Not Found');
      done();
    });
  });

  it('should not serve files without extensions', function (done) {
    request.get('/input')
    .expect(415)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Unsupported Media Type');
      done();
    });
  });

  it('should not serve file types that are not supported', function (done) {
    request.get('/input.gif')
    .expect(415)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.text, 'Unsupported Media Type');
      done();
    });
  });

  it('should serve .jpg', function (done) {
    request.get('/input.jpg')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      baseImage = imageSize(res.body);
      done();
    });
  });

  // TODO: .png, .webp and .tiff

  it('should resize image by width', function (done) {
    request.get('/input.jpg?w=500')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(imageSize(res.body).width, 500);
      done();
    });
  });

  it('should not enlarge image', function (done) {
    request.get('/input.jpg?h=5000')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(imageSize(res.body).height, baseImage.height);
      done();
    });
  });

  it('should set q at 100 max', function (done) {
    request.get('/input.jpg?q=5000')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(imageSize(res.body).height, baseImage.height);
      done();
    });
  });

  it('should not crop image if fit!=crop', function (done) {
    request.get('/input.jpg?h=400&w=400')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      let size = imageSize(res.body);
      assert.notEqual(size.width, size.height);
      done();
    });
  });

  it('should crop image if fit=crop', function (done) {
    request.get('/input.jpg?h=400&w=400&fit=crop')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      let size = imageSize(res.body);
      assert.equal(size.width, size.height);
      done();
    });
  });

  it('should format to .jpg by default', function (done) {
    request.get('/input.jpg?fm=jaja')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.headers['content-type'], 'image/jpeg');
      assert.equal(imageSize(res.body).type, 'jpg');
      done();
    });
  });

  it('should format to .png', function (done) {
    request.get('/input.jpg?fm=png')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.headers['content-type'], 'image/png');
      assert.equal(imageSize(res.body).type, 'png');
      done();
    });
  });

  it('should format to .webp', function (done) {
    request.get('/input.jpg?fm=webp')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(res.headers['content-type'], 'image/webp');
      assert.equal(imageSize(res.body).type, 'webp');
      done();
    });
  });

  it('should default to the default option if querystring is invalid', function (done) {
    request.get('/input.jpg?w=100h=100')
    .expect(200)
    .end(function (err, res) {
      assert.ifError(err);
      assert.equal(imageSize(res.body).width, baseImage.width);
      done();
    });
  });

  // TODO: quality
});
