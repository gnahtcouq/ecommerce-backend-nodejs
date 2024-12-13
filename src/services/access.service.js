'use strict'

const shopModel = require('@/models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('@/services/keyToken.service')
const { findByEmail } = require('@/services/shop.service')
const { Api400Error, Api401Error, Api403Error } = require('@/core/error.response')
const { getInfoData } = require('@/utils')
const { createTokenPair } = require('@/auth/authUtils')
const apiKeyModel = require('@/models/apiKey.model')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: '001',
  READ: '002',
  DELETE: '003',
  ADMIN: '000'
}

class AccessService {
  static handleRefreshToken = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId)
      throw new Api403Error('Something wrong happened. Please re-login!')
    }

    if (keyStore.refreshToken !== refreshToken) throw new Api401Error('Shop not registered')

    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new Api401Error('Shop not registered')

    // create 1 cặp mới
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // đã được sử dụng để lấy token mới rồi
      }
    })

    return {
      user,
      tokens
    }
  }

  /**
   * Action logout
   *
   * @param keyStore
   * @returns {Promise<*>}
   */
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log(delKey)
    return delKey
  }

  static login = async ({ email, password }) => {
    //1.
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new Api400Error('Email not found!')

    //2.
    const match = await bcrypt.compare(password, foundShop.password)
    if (!match) throw new Api401Error('Authentication failed!')

    //3.
    // created privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    //4.
    // const { _id: userId } = foundShop._id
    const userId = foundShop._id
    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken
    })

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop
      }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exists
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) throw new Api400Error('Email already exists!')

      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP]
      })

      if (!newShop) return null

      // created privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      console.log({ privateKey, publicKey }) // save collection KeyStore

      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      })

      if (!keyStore) throw new Api400Error('keyStore error!')

      // apiKey
      const newKey = await apiKeyModel.create({
        key: crypto.randomBytes(64).toString('hex'),
        permissions: ['0000']
      })

      console.log(`Created Token Success::`, tokens)

      return {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: newShop
        }),
        tokens,
        apiKey: getInfoData({
          fields: ['key'],
          object: newKey
        })
      }
    } catch (error) {
      throw new Api400Error(error.message)
    }
  }
}

module.exports = AccessService
