'use strict'

const { SuccessResponse } = require('@/core/success.response')
const CommentService = require('@/services/comment.service')

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add comment successfully!',
      metadata: await CommentService.createComment(req.body)
    }).send(res)
  }

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get comments successfully!',
      metadata: await CommentService.getCommentsByParentId(req.query)
    }).send(res)
  }
}

module.exports = new CommentController()
