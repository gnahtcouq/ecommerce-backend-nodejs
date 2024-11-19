'use strict'

const express = require('express')
const productController = require('@/controllers/product.controller')
const { authenticationV2 } = require('@/auth/authUtils')
const asyncHandler = require('@/helpers/asyncHandler')
const router = express.Router()

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))

// authentication
router.use(authenticationV2)

router.post('', asyncHandler(productController.createProduct))
router.post('/publish/:id', asyncHandler(productController.publishedProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishedProductByShop))

// query
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishedForShop))

module.exports = router
