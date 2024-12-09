require('module-alias/register')
require('dotenv').config()
const nodeEnv = process.env.NODE_ENV

// config dotenv by environment
require('dotenv').config({
  path: `.env.${nodeEnv}`
})

console.log('ENV:::', nodeEnv, ' PORT:::', process.env.PORT)
const PORT = process.env.PORT || 8080

// start server nodejs
const app = require('@/app')
const server = app.listen(PORT, () => {
  console.log(`------::----${process.env.SERVICE_NAME} start with port ${PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => console.log(`Exit Server Express`))
  // notify.send(ping...)
})
