'use strict'

const keyTokenModel = require('@/models/keytoken.model')
const {
  Types: { ObjectId }
} = require('mongoose')

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //     user: userId,
      //     publicKey,
      //     privateKey
      // })

      //return tokens ? tokens.publicKey : null

      // level xxx
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken
        },
        options = { upsert: true, new: true }

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: new ObjectId(userId) }).lean()
  }

  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne({ _id: new ObjectId(id) })
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken: refreshToken }).lean()
  }

  static async findOneAndUpdate(filter, update, options) {
    return await keyTokenModel.findOneAndUpdate(filter, update, options)
  }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.deleteOne({ user: userId })
  }
}

module.exports = KeyTokenService
