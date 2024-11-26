'use strict'

const express = require('express')
const { apiKey, permission } = require('@/auth/checkAuth')
const router = express.Router()

// check apiKey
router.use(apiKey)

// check permission
router.use(permission('0000'))

router.use('/v1/api/auth', require('@/routes/access'))
router.use('/v1/api/product', require('@/routes/product'))
router.use('/v1/api/discount', require('@/routes/discount'))
router.use('/v1/api/cart', require('@/routes/cart'))
router.use('/v1/api/checkout', require('@/routes/checkout'))

module.exports = router
