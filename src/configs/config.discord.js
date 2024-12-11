'use strict'

const { Client, GatewayIntentBits } = require('discord.js')
const {
  notification: { discord }
} = require('@/configs/config')

class DiscordLogConfig {
  constructor() {
    this.connect()
  }

  async connect() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    // add channel id
    this.channelId = discord.channelId

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}`)
    })

    await this.client.login(discord.token)
  }

  static getInstance() {
    if (!DiscordLogConfig.instance) {
      DiscordLogConfig.instance = new DiscordLogConfig()
    }

    return DiscordLogConfig.instance
  }

  sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId)
    if (!channel) return console.error('Channel not found', this.channelId)

    channel.send(message).catch((e) => console.error(e))
  }

  sendToFormatCode(logData) {
    const { code, message = '', title = '' } = logData

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16),
          title: title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
        }
      ]
    }
    this.sendToMessage(codeMessage)
  }
}

const instanceDiscord = DiscordLogConfig.getInstance()
module.exports = instanceDiscord
