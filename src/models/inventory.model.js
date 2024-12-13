'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'inventory'
const COLLECTION_NAME = 'inventories'

// Declare the Schema of the Mongo model
const inventorySchema = new Schema(
  {
    inven_productId: {
      type: Schema.Types.ObjectId,
      ref: 'product'
    },
    inven_location: {
      type: String,
      default: 'unknown'
    },
    inven_stock: {
      type: Number,
      required: true
    },
    inven_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'shop'
    },
    inven_reservations: { type: Array, default: [] }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema)
