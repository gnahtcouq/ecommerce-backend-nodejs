'use strict'

const express = require('express')
const cartController = require('@/controllers/cart.controller')
const asyncHandler = require('@/helpers/asyncHandler')
const router = express.Router()

router.post('', asyncHandler(cartController.addToCart))
router.post('/update', asyncHandler(cartController.updateCartQuantity))
router.delete('', asyncHandler(cartController.deleteUserCart))
router.get('', asyncHandler(cartController.getListUserCart))

module.exports = router
