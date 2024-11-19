'use strict'

const { BadRequestError } = require('@/core/error.response')
const { product, clothing, electronic, furniture } = require('@/models/product.model')
const {
  findAllDraftsForShop,
  publishProductByShop,
  unPublishProductByShop,
  findAllPublishedForShop,
  searchProductsByUser
} = require('@/models/repositories/product.repo')

// define Factory class to create product
class ProductServiceV2 {
  /*
    type: 'Clothing',
    payload
  */

  static productRegistry = {}

  static registerProductType(type, classRef) {
    ProductServiceV2.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductServiceV2.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid product type ${type}`)
    return new productClass(payload).createProduct()
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  }
  // END PUT //

  // query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishedForShop({ query, limit, skip })
  }

  static async searchProducts({ keySearch }) {
    return await searchProductsByUser({ keySearch })
  }
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id })
  }
}

// define sub-class for different product type Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('Create new clothing failed')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('Create new product failed')

    return newProduct
  }
}

// define sub-class for different product type Electronic
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('Create new electronic failed')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('Create new product failed')

    return newProduct
  }
}

// define sub-class for different product type Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newFurniture) throw new BadRequestError('Create new furniture failed')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new BadRequestError('Create new product failed')

    return newProduct
  }
}

// register product type
ProductServiceV2.registerProductType('Clothing', Clothing)
ProductServiceV2.registerProductType('Electronic', Electronic)
ProductServiceV2.registerProductType('Furniture', Furniture)

module.exports = ProductServiceV2
