'use strict'

const express = require('express')
const router = express.Router()
const { apiKey, permission } = require('@/auth/checkAuth')
const { pushToLogDiscord } = require('@/middlewares')

// add log to discord
router.use(pushToLogDiscord)

// check apiKey
router.use(apiKey)

// check permission
router.use(permission('0000'))

router.use('/v1/api/auth', require('@/routes/access'))
router.use('/v1/api/product', require('@/routes/product'))
router.use('/v1/api/discount', require('@/routes/discount'))
router.use('/v1/api/cart', require('@/routes/cart'))
router.use('/v1/api/checkout', require('@/routes/checkout'))
router.use('/v1/api/inventory', require('@/routes/inventory'))
router.use('/v1/api/comment', require('@/routes/comment'))

module.exports = router
