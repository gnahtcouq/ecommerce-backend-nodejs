'use strict'

const shopModel = require('@/models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('@/services/keyToken.service')
const { findByEmail } = require('@/services/shop.service')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('@/core/error.response')
const { getInfoData } = require('@/utils')
const { createTokenPair, verifyJWT } = require('@/auth/authUtils')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  /*
        1 - check this token used?
    */
  static handleRefreshToken = async (refreshToken) => {
    // check refreshToken used or not
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    if (foundToken) {
      // decode xem là thằng nào?
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log({ userId, email })
      // delete all tokens in keyStore
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something wrong happened. Please relogin!')
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('Shop not registered')

    // verifyToken
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
    console.log('[2]--', { userId, email })

    // check userId
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailureError('Shop not registered')

    // create 1 cặp mới
    const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

    // update token
    await KeyTokenService.findOneAndUpdate(
      { _id: holderToken._id },
      {
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken // add the refresh token to the array of used tokens
        }
      },
      { new: true } // to return the updated document
    )

    return {
      user: { userId, email },
      tokens
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log(delKey)
    return delKey
  }

  /*
        1 - check email in dbs
        2 - check password
        3 - create AT and RT and save to dbs
        4 - generate tokens
        5 - get data return login
    */
  static login = async ({ email, password, refreshToken = null }) => {
    //1.
    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new BadRequestError('Email not found!')
    }

    //2.
    const match = await bcrypt.compare(password, foundShop.password)
    if (!match) {
      throw new AuthFailureError('Authentication failed!')
    }

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
        fileds: ['_id', 'name', 'email'],
        object: foundShop
      }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exists
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        throw new BadRequestError('Email already exists!')
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        console.log({ privateKey, publicKey }) // save collection KeyStore

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!keyStore) {
          //throw new BadRequestError('keyStore error!')
          return {
            code: 'xxxx',
            message: 'keyStore error'
          }
        }

        // created token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

        console.log(`Created Token Success::`, tokens)

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fileds: ['_id', 'name', 'email'],
              object: newShop
            }),
            tokens
          }
        }
      }

      return {
        code: 200,
        metadata: null
      }
    } catch (error) {
      console.log(error)
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
