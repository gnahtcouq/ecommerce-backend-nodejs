'use strict'

const { SuccessResponse } = require('@/core/success.response')
const CartService = require('@/services/cart.service')

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add product to cart successfully!',
      metadata: await CartService.addToCart(req.body)
    }).send(res)
  }

  // update + - quantity
  updateCartQuantity = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update cart quantity successfully!',
      metadata: await CartService.updateCartQuantity(req.body)
    }).send(res)
  }

  deleteUserCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete cart successfully!',
      metadata: await CartService.deleteUserCart(req.body)
    }).send(res)
  }

  getListUserCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list cart successfully!',
      metadata: await CartService.getListUserCart(req.query)
    }).send(res)
  }
}

module.exports = new CartController()
