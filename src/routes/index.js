'use strict'

const express = require('express')
const { apiKey, permission } = require('@/auth/checkAuth')
const router = express.Router()

// check apiKey
router.use(apiKey)

// check permission
router.use(permission('0000'))

router.use('/v1/api', require('@/routes/access'))
router.use('/v1/api/product', require('@/routes/product'))

module.exports = router
