/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [Hooks for Reids Instance]
 */
const md5Hash = require('blueimp-md5');
const fmt = require('util').format
const FORMAT = {
  LIMIT: 'LIMIT:%s:%s'
}

module.exports = {
  save (redis) {
    return async function (ip, url, rate) {
      try {
        await redis.set(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)), true, "EX", rate)
      } catch (error) {
        throw error
      }
    }
  },
  find (redis) {
    return async function (ip, url, rate) {
      try {
        const ret = await redis.get(fmt(FORMAT.LIMIT, md5Hash(ip), md5Hash(url)))
        return ret
      } catch (error) {
        throw error
      }
    }
  }
}
