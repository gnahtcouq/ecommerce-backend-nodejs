'use strict'

const redis = require('redis')
const { promisify } = require('util')
const { reservationInventory } = require('@/models/repositories/inventory.repo')
const {
  redis: { host, port, username, password }
} = require('@/configs/config')
const redisClient = redis.createClient({
  port: port,
  host: host
})

redisClient.ping((error, result) => {
  if (error) console.log(`Error connected Redis ${host}:${port}`)
  else console.log(`Connected Redis ${host}:${port}`)
})

const pexpire = promisify(redisClient.pexpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`
  const retryTimes = 10
  const expireTime = 3000 // 3s tạm lock

  for (let i = 0; i < retryTimes.length; i++) {
    // tạo 1 key, thằng nào nắm giữ thì được vào thanh toán
    const result = await setnxAsync(key, expireTime)
    console.log(`result: `, result)
    if (result === 1) {
      // thao tác với inventory
      const isReservation = await reservationInventory({ productId, quantity, cartId })
      if (isReservation.modifiedCount) {
        await pexpire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient)
  return await delAsyncKey(keyLock)
}

module.exports = {
  acquireLock,
  releaseLock
}
