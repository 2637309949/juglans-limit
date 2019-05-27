/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Hooks for Reids Instance]
 */
const md5Hash = require('blueimp-md5')
const assert = require('assert').strict
const is = require('is')
const fmt = require('util').format
const FORMAT = {
  LIMIT: 'LIMIT:%s:%s'
}

function RedisModel({ redis }) {
  if(!(this instanceof RedisModel)) {
    return new RedisModel({ redis })
  }
  assert.ok(!is.undefined(redis), 'redis can not be empty!')
  this.redis = redis
}

RedisModel.prototype.save = async function (ip, url, rate) {
  try {
    await this.redis.set(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)), true, "EX", rate)
  } catch (error) {
    throw error
  }
}


RedisModel.prototype.find = async function (ip, url, rate) {
  try {
    const ret = await this.redis.get(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)))
    return ret
  } catch (error) {
    throw error
  }
}

module.exports.RedisModel = RedisModel