'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'shop'
const COLLECTION_NAME = 'shops'

// Declare the Schema of the Mongo model
const shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150
    },
    email: {
      type: String,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false
    },
    roles: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, shopSchema)
