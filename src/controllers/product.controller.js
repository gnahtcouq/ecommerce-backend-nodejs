'use strict'

const { SuccessResponse } = require('@/core/success.response')
const ProductService = require('@/services/product.service')
const ProductServiceV2 = require('@/services/product.service.xxx')

class ProductController {
  createProduct = async (req, res, next) => [
    // new SuccessResponse({
    //   message: 'Create new product successfully!',
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId
    //   })
    // }).send(res)

    new SuccessResponse({
      message: 'Create new product successfully!',
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  ]
}

module.exports = new ProductController()
