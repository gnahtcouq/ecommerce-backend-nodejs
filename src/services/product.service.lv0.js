'use strict'

const { Api400Error } = require('@/core/error.response')
const { product, clothing, electronic } = require('@/models/product.model')

// define Factory class to create product
class ProductFactory {
  /*
    type: 'Clothing',
    payload
  */
  static async createProduct(type, payload) {
    switch (type) {
      case 'Clothing':
        return new Clothing(payload).createProduct()
      case 'Electronic':
        return new Electronic(payload).createProduct()
      case 'Furniture':
        return new Furniture(payload).createProduct()
      default:
        throw new Api400Error(`Invalid product type ${type}`)
    }
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
    if (!newClothing) throw new Api400Error('Create new clothing failed')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new Api400Error('Create new product failed')

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
    if (!newElectronic) throw new Api400Error('Create new electronic failed')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new Api400Error('Create new product failed')

    return newProduct
  }
}

// define sub-class for different product type Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newFurniture) throw new Api400Error('Create new furniture failed')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new Api400Error('Create new product failed')

    return newProduct
  }
}

module.exports = ProductFactory
