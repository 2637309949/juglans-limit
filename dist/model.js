"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Hooks for Reids Instance]
 */
const md5Hash = require('blueimp-md5');

const fmt = require('util').format;

const FORMAT = {
  LIMIT: 'LIMIT:%s:%s'
};
module.exports = {
  save(redis) {
    return (
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (ip, url, rate) {
          try {
            yield redis.set(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)), true, "EX", rate);
          } catch (error) {
            throw error;
          }
        });

        return function (_x, _x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }()
    );
  },

  find(redis) {
    return (
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(function* (ip, url, rate) {
          try {
            const ret = yield redis.get(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)));
            return ret;
          } catch (error) {
            throw error;
          }
        });

        return function (_x4, _x5, _x6) {
          return _ref2.apply(this, arguments);
        };
      }()
    );
  }

};