'use strict'

const { CREATED, SuccessResponse } = require('@/core/success.response')
const AccessService = require('@/services/access.service')

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: 'Refreshed token successfully!',
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    // }).send(res)

    // v2 fixed, no need accessToken
    new SuccessResponse({
      message: 'Refreshed token successfully!',
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    }).send(res)
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logged out successfully!',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logged in successfully!',
      metadata: await AccessService.login(req.body)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Registered successfully!',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res)
  }
}

module.exports = new AccessController()
