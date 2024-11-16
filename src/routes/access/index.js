'use strict'

const express = require('express')
const accessController = require('@/controllers/access.controller')
const { authentication, authenticationV2 } = require('@/auth/authUtils')
const asyncHandler = require('@/helpers/asyncHandler')
const router = express.Router()

// signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))

// login
router.post('/shop/login', asyncHandler(accessController.login))

// authentication
router.use(authenticationV2)

// logout
router.post('/shop/logout', asyncHandler(accessController.logout))

// handler refreshToken
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))

module.exports = router
