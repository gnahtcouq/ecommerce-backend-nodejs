'use strict'

const { BadRequestError } = require('@/core/error.response')
const { product, clothing, electronic, furniture } = require('@/models/product.model')
const { insertInventory } = require('@/models/repositories/inventory.repo')
const {
  findAllDraftsForShop,
  findAllPublishedForShop,
  findAllProducts,
  findProduct,
  publishProductByShop,
  unPublishProductByShop,
  searchProductsByUser,
  updateProductById
} = require('@/models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('@/utils')

// define Factory class to create product
class ProductService {
  /*
    type: 'Clothing',
    payload
  */

  static productRegistry = {}

  static registerProductType(type, classRef) {
    ProductService.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductService.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid product type ${type}`)
    return new productClass(payload).createProduct()
  }

  static async updateProduct(type, product_id, payload) {
    const productClass = ProductService.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid product type ${type}`)
    return new productClass(payload).updateProduct(product_id)
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

  static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb']
    })
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] })
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
    const newProduct = await product.create({ ...this, _id: product_id })
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
    }
    return newProduct
  }

  async updateProduct(product_id, payload) {
    return await updateProductById({ product_id, payload, model: product })
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

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this)

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: clothing
      })
    }

    const updateProduct = await super.updateProduct(product_id, updateNestedObjectParser(objectParams))
    return updateProduct
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

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this)

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: electronic
      })
    }

    const updateProduct = await super.updateProduct(product_id, updateNestedObjectParser(objectParams))
    return updateProduct
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

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this)

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: furniture
      })
    }

    const updateProduct = await super.updateProduct(product_id, updateNestedObjectParser(objectParams))
    return updateProduct
  }
}

// register product type
ProductService.registerProductType('Clothing', Clothing)
ProductService.registerProductType('Electronic', Electronic)
ProductService.registerProductType('Furniture', Furniture)

module.exports = ProductService
