'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('@/helpers/asyncHandler')
const { Api401Error, Api404Error } = require('@/core/error.response')
const { findByUserId } = require('@/services/keyToken.service')
const { ignoreWhiteList } = require('@/auth/checkAuth')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refresh-token',
  BEARER: 'Bearer '
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
  } catch (error) {
    console.error(`createTokenPair error:: `, error)
  }
}

const authenticationV2 = asyncHandler(async (req, res, next) => {
  if (ignoreWhiteList(req)) return next()

  const userId = req.headers[HEADER.CLIENT_ID]
  const accessToken = extractToken(req.headers[HEADER.AUTHORIZATION])
  const refreshToken = extractToken(req.headers[HEADER.REFRESH_TOKEN])

  //1. Check userId missing???
  if (!userId) throw new Api401Error('Invalid Request')

  //2. Get accessToken
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new Api404Error('Not found keyStore')

  //3. Verify Token
  if (refreshToken) {
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId !== decodeUser.userId) throw new Api401Error('Invalid userId')
      req.user = decodeUser // {userId, email}
      req.keyStore = keyStore
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  if (!accessToken) throw new Api401Error('Invalid Request')

  //4. Check userId in dbs?
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (decodeUser.userId !== userId) throw new Api401Error('Invalid userId')
    req.user = decodeUser
    req.keyStore = keyStore
    return next()
  } catch (error) {
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
  if (!userId) throw new Api401Error('Invalid Request')

  //2.
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new Api404Error('Not found keyStore')

  //3.
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new Api401Error('Invalid Request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (decodeUser.userId !== userId) throw new Api401Error('Invalid userId')
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

const extractToken = (tokenHeader) => {
  if (!tokenHeader) return ''
  return tokenHeader.replace(HEADER.BEARER, '')
}

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
}
