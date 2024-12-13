'use strict'

const commentModel = require('@/models/comment.model')
const { convertToObjectIdMongodb } = require('@/utils')
const { Api404Error } = require('@/core/error.response')
const { findProduct } = require('@/models/repositories/product.repo')

/*
  key features:
  - add comment [User, Shop]
  - get a list of comments [User, Shop]
  - delete a comment [User, Shop, Admin]
*/

class CommentService {
  static async createComment({ productId, userId, content, parentCommentId = null }) {
    // check the product exists in the database
    const foundProduct = await findProduct({ product_id: productId })
    if (!foundProduct) throw new Api404Error('Product not found')

    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId
    })

    let rightValue = 0
    if (parentCommentId) {
      // reply comment
      const parentComment = await commentModel.findById(parentCommentId)
      if (!parentComment) throw new Api404Error('Parent comment not found')

      rightValue = parentComment.comment_right

      // updateMany comments
      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue }
        },
        { $inc: { comment_right: 2 } }
      )

      await commentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue }
        },
        { $inc: { comment_left: 2 } }
      )
    } else {
      const maxRightValue = await commentModel.findOne(
        { comment_productId: convertToObjectIdMongodb(productId) },
        'comment_right',
        { $sort: { comment_right: -1 } }
      )
      if (maxRightValue) rightValue = maxRightValue.comment_right + 1
      else rightValue = 1
    }

    // insert to comment
    comment.comment_left = rightValue
    comment.comment_right = rightValue + 1

    await comment.save()
    return comment
  }

  static async getCommentsByParentId({ productId, parentCommentId = null, limit = 50, offset = 0 }) {
    if (parentCommentId) {
      const parentComment = await commentModel.findById(parentCommentId)
      if (!parentComment) throw new Api404Error('Parent comment not found')
      const comments = await commentModel
        .find({
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: parentComment.comment_left },
          comment_right: { $lt: parentComment.comment_right }
        })
        .select({
          comment_content: 1,
          comment_parentId: 1,
          comment_left: 1,
          comment_right: 1
        })
        .limit(limit)
        .skip(offset)
        .sort({ comment_left: 1 })

      return comments
    }

    const comments = await commentModel
      .find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_parentId: parentCommentId
      })
      .select({
        comment_content: 1,
        comment_parentId: 1,
        comment_left: 1,
        comment_right: 1
      })
      .limit(limit)
      .skip(offset)
      .sort({ comment_left: 1 })

    return comments
  }

  static async deleteComment({ productId, commentId }) {
    // check the product exists in the database
    const foundProduct = await findProduct({ product_id: productId })
    if (!foundProduct) throw new Api404Error('Product not found')

    // 1. xác định giá trị left và right của commentId
    const comment = await commentModel.findById(commentId)
    if (!comment) throw new Api404Error('Comment not found')
    const leftValue = comment.comment_left
    const rightValue = comment.comment_right

    // 2. tính width của commentId
    const width = rightValue - leftValue + 1

    // 3. xóa commentId và tất cả các comment có left > leftValue và right < rightValue
    await commentModel.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue, $lte: rightValue }
    })

    // 4. cập nhật giá trị left và right còn lại
    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue }
      },
      { $inc: { comment_left: -width } }
    )

    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gt: rightValue }
      },
      { $inc: { comment_right: -width } }
    )

    return true
  }
}

module.exports = CommentService
