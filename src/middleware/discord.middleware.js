'use strict'

const instanceDiscord = require('@/configs/config.discord')

const pushToLogDiscord = async (req, res, next) => {
  try {
    instanceDiscord.sendToFormatCode({
      title: `Method: ${req.method}`,
      code: req.method === 'GET' ? req.query : req.body,
      message: `${req.get('host')}${req.originalUrl}`
    })
    return next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  pushToLogDiscord
}
