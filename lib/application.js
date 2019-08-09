// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const assert = require('assert').strict
const deepmerge = require('deepmerge')
const is = require('is')
const model = require('./model')

const defaultRate = 1
const defaultOpts = {
  frequency: {
    rules: [],
    passages: [],
    async failureHandler (ctx) {
      ctx.status = 500
      ctx.body = {
        message: 'Internal Server Error',
        stack: 'Rate Limited access, Pease Check Again Later.'
      }
    }
  }
}

module.exports = (cfg = {}) => async function ({ router, config }) {
  const model = cfg.frequency.model
  delete cfg.frequency.model
  cfg = deepmerge.all([defaultOpts, cfg])
  cfg.frequency.model = model
  assert.ok(is.object(cfg.frequency.model), 'cfg.frequency.model can not be empty!')
  assert.ok(is.function(cfg.frequency.failureHandler), 'cfg.frequency.failureHandler can not be empty!')
  router.use(async function (ctx, next) {
    const method = ctx.method.toUpperCase()
    const ip = ctx.ip
    const reqPath = ctx.request.path
    const url = ctx.request.url
    if (passagesMatch(cfg.frequency.passages)) {
      await next()
      return
    }
    const rule = ruleMatch(cfg.frequency.rules, reqPath, method)
    if (rule) {
      const line = await cfg.frequency.model.find(ip, url, rule.rate || defaultRate)
      if (line) {
        await cfg.frequency.failureHandler(ctx)
        return
      } else {
        await cfg.frequency.model.save(ip, url, rule.rate || defaultRate)
      }
    }
    await next()
  })
}

function passagesMatch (passages, reqPath) {
  return !!passages.find(x => {
    if (is.regexp(x)) {
      return x.test(reqPath)
    } else if (is.string(x)) {
      return x === reqPath
    }
    return false
  })
}

function ruleMatch (rules, reqPath, reqMethod) {
  return rules.find(x => {
    let ruleMatch = false
    let methodMatch = true
    if (is.regexp(x.match)) {
      ruleMatch = x.match.test(reqPath)
    } else if (is.string(x.match)) {
      ruleMatch = x.match === reqPath
    }
    if (x.methods && x.methods.length > 0) {
      methodMatch = !!x.methods.find(x => x.toUpperCase() === reqMethod)
    }
    return methodMatch && ruleMatch
  })
}

module.exports.model = model
