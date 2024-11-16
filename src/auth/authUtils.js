'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('@/helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('@/core/error.response')
const { findByUserId } = require('@/services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days'
    })

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days'
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err)
      } else {
        console.log(`decode verify::`, decode)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {}
}

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
        1 - Check userId missing???
        2 - Get accessToken
        3 - Verify Token
        4 - Check userId in dbs?
        5 - Check keyStore with this userId?
        6 - OK -> return next()
    */

  //1.
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request')

  //2.
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found keyStore')

  //3.
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (decodeUser.userId !== userId) throw new AuthFailureError('Invalid userId')
      req.keyStore = keyStore
      req.user = decodeUser // {userId, email}
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      console.log('error verify::', error)
      throw error
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid Request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (decodeUser.userId !== userId) throw new AuthFailureError('Invalid userId')
    req.keyStore = keyStore
    return next()
  } catch (error) {
    console.log('error verify::', error)
    throw error
  }
})

const authentication = asyncHandler(async (req, res, next) => {
  /*
        1 - Check userId missing???
        2 - Get accessToken
        3 - Verify Token
        4 - Check userId in dbs?
        5 - Check keyStore with this userId?
        6 - OK -> return next()
    */

  //1.
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request')

  //2.
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found keyStore')

  //3.
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid Request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (decodeUser.userId !== userId) throw new AuthFailureError('Invalid userId')
    req.keyStore = keyStore
    return next()
  } catch (error) {
    console.log('error verify::', error)
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
}
