const RedisPubService = require('@/services/redisPubsub.service')

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity
    }
    console.log(`productId`, productId)
    RedisPubService.publish('purchase_events', JSON.stringify(order))
  }
}

module.exports = new ProductServiceTest()
