'use strict'

const express = require('express')
const productController = require('@/controllers/product.controller')
const { authentication } = require('@/auth/authUtils')
const asyncHandler = require('@/helpers/asyncHandler')
const router = express.Router()

// authentication
router.use(authentication)

// create new product
router.post('', asyncHandler(productController.createProduct))

module.exports = router
