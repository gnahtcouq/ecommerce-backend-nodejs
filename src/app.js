require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const configs = require('@/configs/config')
const { checkEnable } = require('@/utils')
const app = express()

// init middlewares
app.use(morgan('dev'))
// app.use(morgan('compile'))
// app.use(morgan('common'))
// app.use(morgan('short'))
// app.use(morgan('tiny'))

// setting security helmet
const helmet = require('helmet')
// setting base
app.use(
  helmet.frameguard({
    action: 'deny'
  })
)
// strict transport security
const reqDuration = 2629746000
app.use(
  helmet.hsts({
    maxAge: reqDuration
  })
)

// content security policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  })
)
// x content type options
app.use(helmet.noSniff())
// x xss protection
app.use(helmet.xssFilter())
// referrer policy
app.use(
  helmet.referrerPolicy({
    policy: 'no-referrer'
  })
)

// downsize response
app.use(
  compression({
    level: 6, // level compress
    threshold: 100 * 1024, // > 100kb threshold to compress
    filter: (req) => {
      return !req.headers['x-no-compress']
    }
  })
)

// setting body parser
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// test pub.sub redis
require('@/tests/inventory.test')
const productTest = require('@/tests/product.test')
productTest.purchaseProduct('product:001', 10)

// init db
if (checkEnable(configs.db.enable)) {
  require('@/configs/config.mongodb')
  // const { checkOverload } = require('@/helpers/check.connect')
  // checkOverload()
}

// init logger
const expressWinston = require('express-winston')
const { logger } = require('@/configs/config.logger')

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
  })
)

// init routes
app.use('/', require('@/routes'))

// handling error
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

module.exports = app
