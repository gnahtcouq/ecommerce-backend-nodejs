'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'cart'
const COLLECTION_NAME = 'carts'

// Declare the Schema of the Mongo model
const cartSchema = new Schema({
  cart_state: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'failed', 'pending'],
    default: 'active'
  },
  cart_products: { type: Array, required: true, default: [] },
  /*
    cart_products: [
      {
        product_id,
        shopId,
        quantity,
        name,
        price
      }
    ]
  */
  cart_count_products: { type: Number, default: 0 },
  cart_userId: { type: Number, required: true }
}, {
  timestamps: {
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn'
  },
  collection: COLLECTION_NAME
})

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema)
