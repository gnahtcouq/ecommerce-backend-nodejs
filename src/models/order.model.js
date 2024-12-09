'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'order'
const COLLECTION_NAME = 'orders'

const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    /*
      order_checkout = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0
      }
    */
    order_shipping: { type: Object, default: {} },
    /*
      order_shipping = {
        street,
        city,
        state,
        country
      }
    */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: '#0000104122024' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
      default: 'pending'
    }
  },
  {
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
  }
)

module.exports = {
  order: model(DOCUMENT_NAME, orderSchema)
}
