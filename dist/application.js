"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const assert = require('assert').strict;

const deepmerge = require('deepmerge');

const is = require('is');

const logger = require('./logger');

const model = require('./model');

const defaultRate = 1;
const defaultOpts = {
  frequency: {
    rules: [],
    passages: [],

    failureHandler(ctx) {
      return _asyncToGenerator(function* () {
        ctx.status = 500;
        ctx.body = {
          message: 'Internal Server Error',
          stack: 'Rate Limited access, Pease Check Again Later.'
        };
      })();
    }

  }
};

module.exports = function () {
  let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(function* (_ref) {
        let {
          router,
          config
        } = _ref;
        const model = cfg.frequency.model;
        delete cfg.frequency.model;
        cfg = deepmerge.all([defaultOpts, cfg]);
        cfg.frequency.model = model;
        assert.ok(is.object(cfg.frequency.model), 'cfg.frequency.model can not be empty!');
        assert.ok(is.function(cfg.frequency.failureHandler), 'cfg.frequency.failureHandler can not be empty!');
        router.use(
        /*#__PURE__*/
        function () {
          var _ref3 = _asyncToGenerator(function* (ctx, next) {
            try {
              const method = ctx.method.toUpperCase();
              const ip = ctx.ip;
              const reqPath = ctx.request.path;
              const url = ctx.request.url;

              if (passagesMatch(cfg.frequency.passages)) {
                return yield next();
              }

              const rule = ruleMatch(cfg.frequency.rules, reqPath, method);

              if (rule) {
                const line = yield cfg.frequency.model.find(ip, url, rule.rate || defaultRate);

                if (line) {
                  return yield cfg.frequency.failureHandler(ctx);
                } else {
                  yield cfg.frequency.model.save(ip, url, rule.rate || defaultRate);
                }
              }

              yield next();
            } catch (err) {
              logger.error(err.stack || err.message);
              throw err;
            }
          });

          return function (_x2, _x3) {
            return _ref3.apply(this, arguments);
          };
        }());
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
};

function passagesMatch(passages, reqPath) {
  return !!passages.find(x => {
    if (is.regexp(x)) {
      return x.test(reqPath);
    } else if (is.string(x)) {
      return x === reqPath;
    }

    return false;
  });
}

function ruleMatch(rules, reqPath, reqMethod) {
  return rules.find(x => {
    let ruleMatch = false;
    let methodMatch = true;

    if (is.regexp(x.match)) {
      ruleMatch = x.match.test(reqPath);
    } else if (is.string(x.match)) {
      ruleMatch = x.match === reqPath;
    }

    if (x.methods && x.methods.length > 0) {
      methodMatch = !!x.methods.find(x => x.toUpperCase() === reqMethod);
    }

    return methodMatch && ruleMatch;
  });
}

module.exports.model = model;