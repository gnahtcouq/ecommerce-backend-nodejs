'use strict'

const { SuccessResponse } = require('@/core/success.response')
const ProductService = require('@/services/product.service')
const ProductServiceV2 = require('@/services/product.service.xxx')

class ProductController {
  createProduct = async (req, res, next) => {
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
  }

  publishedProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Published product successfully!',
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  unPublishedProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'unPublished product successfully!',
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  // QUERY //
  /**
   * @desc Get all drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list drafts successfully!',
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list published successfully!',
      metadata: await ProductServiceV2.findAllPublishedForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list search product successfully!',
      metadata: await ProductServiceV2.searchProducts(req.params)
    }).send(res)
  }
  // END QUERY //
}

module.exports = new ProductController()
