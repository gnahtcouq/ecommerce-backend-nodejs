'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'comment'
const COLLECTION_NAME = 'comments'

const commentSchema = new Schema(
  {
    comment_productId: { type: Schema.Types.ObjectId, ref: 'product' },
    comment_userId: { type: Number, defaut: 1 },
    comment_content: { type: String, default: 'text' },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, commentSchema)
