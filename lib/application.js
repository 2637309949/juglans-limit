/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-09 16:55:19
 * @modify date 2019-01-09 16:55:19
 * @desc [limit]
 */
const assert = require('assert').strict
const is = require('is')
const Redis = require('juglans-addition').Redis
const model = require('./model')

const defaultRate = 1
const defaultFailureHandler = async function (ctx) {
  ctx.status = 500
  ctx.body = {
    message: 'Rate Limited access, Pease Check Again Later.'
  }
}

module.exports = (cfg = {}) => async function ({ router, config }) {
  if (!(cfg && cfg.frequency && cfg.frequency.find) || !(cfg && cfg.frequency && cfg.frequency.save) && config.redis) {
    const redis = Redis.retryConnect(config.redis.uri, config.redis.opts, function (err) {
      if (err) {
        console.error(err)
      }
    })
    cfg.frequency = cfg.frequency || {},
    cfg.frequency.find = model.find(redis)
    cfg.frequency.save = model.save(redis)
  }
  cfg.frequency.failureHandler = cfg.frequency.failureHandler || defaultFailureHandler
  assert.ok(is.function(cfg.frequency.find), 'cfg.frequency.find can not be empty!')
  assert.ok(is.function(cfg.frequency.save), 'cfg.frequency.save can not be empty!')
  assert.ok(is.function(cfg.frequency.failureHandler), 'cfg.frequency.failureHandler can not be empty!')

  router.use(async function (ctx, next) {
    try {
      const method = ctx.method.toUpperCase()
      const ip = ctx.ip
      const reqPath = ctx.request.path
      const url = ctx.request.url

      // skip rate check
      if (cfg.frequency && cfg.frequency.passages && cfg.frequency.passages.length > 0) {
        const pass = cfg.frequency.passages.find(x => {
          if(is.regexp(x)) {
            return x.test(reqPath)
          } else if(is.string(x)) {
            return x === reqPath
          }
          return false
        })
        if(pass) {
          return await next()
        }
      }

      // rate check
      if(cfg.frequency && cfg.frequency.rules.length > 0) {
        const rule = cfg.frequency.rules.find(x => {
          let ruleMatch = false
          let methodMatch = true
          if(is.regexp(x.match)) {
            ruleMatch = x.match.test(reqPath)
          } else if(is.string(x.match)) {
            ruleMatch = x.match === reqPath
          }
          if(x.methods && x.methods.length > 0) {
            methodMatch = !!x.methods.find(x => x.toUpperCase() === method)
          }
          return methodMatch && ruleMatch
        })
        if (rule) {
          const line = await cfg.frequency.find(ip, url, rule.rate || defaultRate)
          if(line) {
            return await cfg.frequency.failureHandler(ctx)
          } else {
            await cfg.frequency.save(ip, url, rule.rate || defaultRate)
          }
        }
      }
      await next()
    } catch (err) {
      throw err
    }
  })
}
