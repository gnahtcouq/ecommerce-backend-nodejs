const config = {
  app: {
    port: process.env.PORT,
    env: process.env.NODE_ENV
  },
  db: {
    enable: process.env.MONGO_ENABLE,
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    name: process.env.MONGO_DATABASE
    // username: process.env.MONGO_USERNAME,
    // password: process.env.MONGO_PASSWORD
  },
  logger: {
    serviceName: process.env.SERVICE_NAME
  },
  notification: {
    discord: {
      token: process.env.DISCORD_TOKEN,
      channelId: process.env.DISCORD_CHANNEL
    }
  }
}

module.exports = config
