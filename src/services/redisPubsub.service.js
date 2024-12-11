const Redis = require('redis')

class RedisPubService {
  constructor() {
    this.subscriber = Redis.createClient()
    this.publisher = Redis.createClient()
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err)
        }
        resolve(reply)
      })
    })
  }

  subscribe(channel, callback) {
    this.subscriber.subscribe(channel)
    this.subscriber.on('message', (subChannel, message) => {
      if (subChannel === channel) {
        callback(channel, message)
      }
    })
  }
}

module.exports = new RedisPubService()
