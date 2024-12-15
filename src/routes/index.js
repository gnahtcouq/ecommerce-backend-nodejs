'use strict'

const express = require('express')
const router = express.Router()
const { apiKey, permission } = require('@/auth/checkAuth')
const { pushToLogDiscord } = require('@/middleware/discord.middleware')

// add log to discord
router.use(pushToLogDiscord)

// check apiKey
router.use(apiKey)

// check permission
router.use(permission('0000'))

router.use('/api/v1/auth', require('@/routes/access'))
router.use('/api/v1/product', require('@/routes/product'))
router.use('/api/v1/discount', require('@/routes/discount'))
router.use('/api/v1/cart', require('@/routes/cart'))
router.use('/api/v1/checkout', require('@/routes/checkout'))
router.use('/api/v1/inventory', require('@/routes/inventory'))
router.use('/api/v1/comment', require('@/routes/comment'))
router.use('/api/v1/notification', require('@/routes/notification'))

module.exports = router
