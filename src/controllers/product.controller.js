'use strict'

const { SuccessResponse } = require('@/core/success.response')
const ProductService = require('@/services/product.service')

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new product successfully!',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update product successfully!',
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.product_id, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  publishedProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Published product successfully!',
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  unPublishedProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'unPublished product successfully!',
      metadata: await ProductService.unPublishProductByShop({
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
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list published successfully!',
      metadata: await ProductService.findAllPublishedForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list search product successfully!',
      metadata: await ProductService.searchProducts(req.params)
    }).send(res)
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list products successfully!',
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res)
  }

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get detail product successfully!',
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  }
  // END QUERY //
}

module.exports = new ProductController()
