# imgop

Image-optimisation server powered by `libvips`

```
/example.jpg?w=1050&h=700
```

## Requirements

- `libvips`
- `iojs`

## How it works

- Retrieve images from an s3 bucket
- Cache downloaded images to the file system for subsequent renders using `fs-lru-cache`
- Resize and adjust image quality using parameters added to the querystring
- Use behind a CDN to cache resized images

## Usage

  Set the following environment variables:

  ```
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  IMGOP_BUCKET // bucket to retrieve images from
  ```

  Install `imgop` and run it on your server:

  ```bash
  $ npm install -g imgop
  $ imgop
  ```

  The available options are:

  ```
  Usage: imgop [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  Port to listen on [$PORT or 3000]
  ```

  Alternatively, you can also require `imgop` as a module which returns a `Function` that creates a `http.Server` instance.

  ```js
  require('imgop')()
  .listen(3000);
  ```

  Modify an image by adding parameters to the querystring:

  ```
  http://localhost:3000/example.jpg?w=1050&h=700&q=75&fit=crop&fm=png
  ```

## API

Similar to [`imgix`](http://www.imgix.com/docs/reference) with only the following parameters supported.

### `w`

Width.

### `h`

Height.

### `q`

Quality. Default is `80`.

### `fit`

Fit mode. `max` or `crop`. Default is `max`.

### `fm`

Format. `jpg`, `png` or `webp`. Default is `jpg`.

## Credits

[sharp](https://github.com/lovell/sharp)

[simgr](https://github.com/mgmtio/simgr)
