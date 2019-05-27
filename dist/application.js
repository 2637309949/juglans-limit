"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [limit]
 */
const assert = require('assert').strict;

const is = require('is');

const model = require('./model');

const defaultRate = 1;

const defaultFailureHandler =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    ctx.status = 500;
    ctx.body = {
      message: 'Rate Limited access, Pease Check Again Later.'
    };
  });

  return function defaultFailureHandler(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = function () {
  let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (_ref2) {
        let {
          router,
          config
        } = _ref2;
        cfg.frequency = cfg.frequency || {};
        cfg.frequency.failureHandler = cfg.frequency.failureHandler || defaultFailureHandler;
        assert.ok(is.object(cfg.frequency.model), 'cfg.frequency.model can not be empty!');
        assert.ok(is.function(cfg.frequency.failureHandler), 'cfg.frequency.failureHandler can not be empty!');
        router.use(
        /*#__PURE__*/
        function () {
          var _ref4 = _asyncToGenerator(function* (ctx, next) {
            try {
              const method = ctx.method.toUpperCase();
              const ip = ctx.ip;
              const reqPath = ctx.request.path;
              const url = ctx.request.url; // Skip rate check

              if (cfg.frequency && cfg.frequency.passages && cfg.frequency.passages.length > 0) {
                const pass = cfg.frequency.passages.find(x => {
                  if (is.regexp(x)) {
                    return x.test(reqPath);
                  } else if (is.string(x)) {
                    return x === reqPath;
                  }

                  return false;
                });

                if (pass) {
                  return yield next();
                }
              } // Rule check


              if (cfg.frequency && cfg.frequency.rules.length > 0) {
                const rule = cfg.frequency.rules.find(x => {
                  let ruleMatch = false;
                  let methodMatch = true;

                  if (is.regexp(x.match)) {
                    ruleMatch = x.match.test(reqPath);
                  } else if (is.string(x.match)) {
                    ruleMatch = x.match === reqPath;
                  }

                  if (x.methods && x.methods.length > 0) {
                    methodMatch = !!x.methods.find(x => x.toUpperCase() === method);
                  }

                  return methodMatch && ruleMatch;
                });

                if (rule) {
                  const line = yield cfg.frequency.model.find(ip, url, rule.rate || defaultRate);

                  if (line) {
                    return yield cfg.frequency.failureHandler(ctx);
                  } else {
                    yield cfg.frequency.model.save(ip, url, rule.rate || defaultRate);
                  }
                }
              } // All Pass


              yield next();
            } catch (err) {
              throw err;
            }
          });

          return function (_x3, _x4) {
            return _ref4.apply(this, arguments);
          };
        }());
      });

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
};

module.exports.model = model;