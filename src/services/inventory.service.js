'use strict'

const { Api404Error } = require('@/core/error.response')
const inventoryModel = require('@/models/inventory.model')
const { getProductById } = require('@/models/repositories/product.repo')

class InventoryService {
  static async addStockToInventory({ stock, productId, shopId, location = 'Nha Trang City' }) {
    const product = await getProductById(productId)
    if (!product) throw new Api404Error('Product not found!')

    const query = { inven_shopId: shopId, inven_productId: productId },
      updateSet = {
        $inc: {
          inven_stock: stock
        },
        $set: {
          inven_location: location
        }
      },
      options = { upsert: true, new: true }

    return await inventoryModel.findOneAndUpdate(query, updateSet, options)
  }
}

module.exports = InventoryService
