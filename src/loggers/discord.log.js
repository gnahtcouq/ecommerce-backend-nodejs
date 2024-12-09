'use strict'

const { Client, GatewayIntentBits } = require('discord.js')
const { CHANNELID_DISCORD, TOKEN_DISCORD } = process.env

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    // add channel id
    this.channelId = CHANNELID_DISCORD

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}`)
    })

    this.client.login(TOKEN_DISCORD)
  }

  sendToFormatCode(logData) {
    const { code, message = 'This is some additional information about the code.', title = 'Code Example' } = logData

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

  sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId)
    if (!channel) return console.error('Channel not found', this.channelId)

    channel
      .send(message)
      .then(() => console.log('Message sent successfully'))
      .catch((e) => console.error(e))
  }
}

module.exports = new LoggerService()
