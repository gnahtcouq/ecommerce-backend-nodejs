'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true
    },
    discount_description: {
      type: String,
      required: true
    },
    discount_type: {
      type: String,
      default: 'fixed_amount', // percentage
      required: true
    },
    discount_value: {
      type: Number,
      required: true
    },
    discount_code: {
      type: String,
      required: true
    },
    discount_start_date: {
      type: Date,
      required: true
    },
    discount_end_date: {
      type: Date,
      required: true
    },
    discount_max_users: {
      type: Number,
      required: true
    },
    discount_user_count: {
      type: Number,
      required: true
    },
    discount_user_used: {
      type: Array,
      default: []
    },
    discount_max_users_per_user: {
      type: Number,
      required: true
    },
    discount_min_order_value: {
      type: Number,
      required: true
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    },
    discount_is_active: {
      type: Boolean,
      default: true
    },
    discount_apply_to: {
      type: [String],
      required: true,
      enum: ['all', 'specific']
    },
    discount_products: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)
