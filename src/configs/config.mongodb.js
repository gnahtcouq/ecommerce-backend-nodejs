'use strict'

const mongoose = require('mongoose')
const { countConnect } = require('@/helpers/check.connect')
const {
  db: { host, name, port }
} = require('@/configs/config')

const connectString = `mongodb://${host}:${port}/${name}`
const MAX_POLL_SIZE = 50
const TIME_OUT_CONNECT = 10000

mongoose.set('strictQuery', true)

class Database {
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }

    mongoose
      .connect(connectString, {
        serverSelectionTimeoutMS: TIME_OUT_CONNECT,
        maxPoolSize: MAX_POLL_SIZE
      })
      .then((_) => {
        console.log(`Connected Mongodb ${host}:${port}/${name}, Number of connections:`, countConnect())
      })
      .catch((err) => console.log(`Error connected Mongodb`, err))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb
