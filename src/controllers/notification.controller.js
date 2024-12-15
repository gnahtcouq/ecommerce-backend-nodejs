'use strict'

const { SuccessResponse } = require('@/core/success.response')
const NotificationService = require('@/services/notification.service')

class NotificationController {
  listNotificationByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get notifications successfully!',
      metadata: await NotificationService.listNotificationByUser(req.query)
    }).send(res)
  }
}

module.exports = new NotificationController()
