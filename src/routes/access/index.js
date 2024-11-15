'use strict'

const express = require('express')
const accessController = require('@/controllers/access.controller')
const { authentication } = require('@/auth/authUtils')
const asyncHandler = require('@/helpers/asyncHandler')
const router = express.Router()

// signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))

// login
router.post('/shop/login', asyncHandler(accessController.login))

// authentication
router.use(authentication)

// logout
router.post('/shop/logout', asyncHandler(accessController.logout))

module.exports = router