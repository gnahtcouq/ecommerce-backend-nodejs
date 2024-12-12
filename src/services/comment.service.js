'use strict'

const commentModel = require('@/models/comment.model')
const { convertToObjectIdMongodb } = require('@/utils')
const { BadRequestError, NotFoundError } = require('@/core/error.response')

/*
  key features:
  - add comment [User, Shop]
  - get a list of comments [User, Shop]
  - delete a comment [User, Shop, Admin]
*/

class CommentService {
  static async createComment({ productId, userId, content, parentCommentId = null }) {
    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId
    })

    let rightValue
    if (parentCommentId) {
      // reply comment
      const parentComment = await commentModel.findById(parentCommentId)
      if (!parentComment) throw new NotFoundError('Parent comment not found')
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
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue }
        },
        { $inc: { comment_right: 2 } }
      )
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1
      } else {
        rightValue = 1
      }
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
      if (!parentComment) throw new NotFoundError('Parent comment not found')
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
}

module.exports = CommentService
