"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const md5Hash = require('blueimp-md5');

const assert = require('assert').strict;

const is = require('is');

const fmt = require('util').format;

const FORMAT = {
  LIMIT: 'LIMIT:%s:%s'
};

function RedisModel(_ref) {
  let {
    redis
  } = _ref;

  if (!(this instanceof RedisModel)) {
    return new RedisModel({
      redis
    });
  }

  assert.ok(!is.undefined(redis), 'redis can not be empty!');
  this.redis = redis;
}

RedisModel.prototype.save =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (ip, url, rate) {
    try {
      const key = fmt(FORMAT.LIMIT, md5Hash(ip), url);
      const incr = yield this.redis.get(key);

      if (!incr) {
        yield this.redis.set(key, 1, 'EX', 10);
      } else {
        yield this.redis.incr(key);
      }
    } catch (error) {
      throw error;
    }
  });

  return function (_x, _x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

RedisModel.prototype.find =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (ip, url, rate) {
    try {
      const key = fmt(FORMAT.LIMIT, md5Hash(ip), url);
      const ret = yield this.redis.get(key);

      if (ret) {
        const retInt = parseInt(ret);

        if (retInt <= rate) {
          return;
        }
      }

      return ret;
    } catch (error) {
      throw error;
    }
  });

  return function (_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

module.exports.RedisModel = RedisModel;