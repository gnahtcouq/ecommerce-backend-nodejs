'use strict'

const { Created, SuccessResponse } = require('@/core/success.response')
const AccessService = require('@/services/access.service')

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: 'Refreshed token successfully!',
      metadata: await AccessService.handleRefreshToken({
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
    new Created({
      message: 'Registered successfully!',
      metadata: await AccessService.signUp(req.body)
      // options: {
      //   limit: 10
      // }
    }).send(res)
  }
}

module.exports = new AccessController()
