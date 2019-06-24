// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const md5Hash = require('blueimp-md5')
const assert = require('assert').strict
const is = require('is')
const fmt = require('util').format
const FORMAT = {
  LIMIT: 'LIMIT:%s:%s'
}

function RedisModel ({ redis }) {
  if (!(this instanceof RedisModel)) {
    return new RedisModel({ redis })
  }
  assert.ok(!is.undefined(redis), 'redis can not be empty!')
  this.redis = redis
}

RedisModel.prototype.save = async function (ip, url, rate) {
  try {
    const key = fmt(FORMAT.LIMIT, md5Hash(ip), url)
    const incr = await this.redis.get(key)
    if (!incr) {
      await this.redis.set(key, 1, 'EX', 10)
    } else {
      await this.redis.incr(key)
    }
  } catch (error) {
    throw error
  }
}

RedisModel.prototype.find = async function (ip, url, rate) {
  try {
    const key = fmt(FORMAT.LIMIT, md5Hash(ip), url)
    const ret = await this.redis.get(key)
    if (ret) {
      const retInt = parseInt(ret)
      if (retInt <= rate) {
        return
      }
    }
    return ret
  } catch (error) {
    throw error
  }
}

module.exports.RedisModel = RedisModel
