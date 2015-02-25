'use strict';

import Cache from 'fs-lru-cache';

let cache = new Cache('imgop');

export default cache;
