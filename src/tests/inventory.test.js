const RedisPubService = require('@/services/redisPubsub.service')

class InventoryServiceTest {
  constructor() {
    RedisPubService.subscribe('purchase_events', (channel, message) => {
      console.log(`Received message from channel ${channel}: ${message}`)
      InventoryServiceTest.updateInventory(JSON.parse(message))
    })
  }

  static updateInventory({ productId, quantity }) {
    console.log(`[0001]: Update inventory for product ${productId} with quantity ${quantity}`)
  }
}

module.exports = new InventoryServiceTest()
