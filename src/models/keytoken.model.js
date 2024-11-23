'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'key'
const COLLECTION_NAME = 'keys'

const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop'
    },
    privateKey: {
      type: String,
      required: true
    },
    publicKey: {
      type: String,
      required: true
    },
    refreshTokensUsed: {
      type: Array,
      default: [] // những refreshToken đã được sử dụng
    },
    refreshToken: {
      type: String,
      required: true
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema)
