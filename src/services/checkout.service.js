'use strict'

const { findCartById } = require('@/models/repositories/cart.repo')
const { Api400Error, Api404Error } = require('@/core/error.response')
const { checkProductByServer } = require('@/models/repositories/product.repo')
const { acquireLock, releaseLock } = require('@/services/redis.service')
const orderModel = require('@/models/order.model')
const cartModel = require('@/models/cart.model')
const DiscountService = require('@/services/discount.service')

class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cartid exist
    const foundCart = await findCartById(cartId)
    if (!foundCart) throw new Api404Error('Cart not found!')

    const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0
      },
      shop_order_ids_new = []

    // tính tổng tiền bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
      // check product available
      const checkProductServer = await checkProductByServer(item_products)
      console.log('checkProductServer', checkProductServer)
      if (!checkProductServer[0]) throw new Api400Error('Order product not available!')

      // tổng tiền đơn hàng
      const checkoutPrice = checkProductServer.reduce((total, product) => {
        return total + product.price * product.quantity
      }, 0)

      // tổng tiền trước khi xử lý
      checkout_order.totalPrice += checkoutPrice

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tiền trước khi giảm giá
        priceApplyDiscount: checkoutPrice, // tiền sau khi giảm giá
        item_products: checkProductServer
      }

      // nếu shop_discounts tồn tại > 0, check xem có hợp lệ hay không
      if (shop_discounts.length > 0) {
        // giả sử chỉ có 1 discount
        const { totalPrice = 0, discount = 0 } = await DiscountService.getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer
        })

        // tổng discount giảm giá
        checkout_order.totalDiscount += discount

        // nếu tiền giảm giá > 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = totalPrice - discount
        }
      }
      // tổng thanh toán cuối cùng
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    }
  }

  // order
  static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
    const { shop_order_ids_news, checkout_order } = await this.checkoutReview({ cartId, userId, shop_order_ids })

    // check lại 1 lần nữa xem vượt tồn kho hay không?
    // get new array Products
    const products = shop_order_ids_news.flatMap((order) => order.item_products)
    console.log(`[1]:`, products)
    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(keyLock ? true : false)
      if (keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check nếu có 1 sản phẩm hết hàng trong kho
    if (acquireProduct.includes(false)) {
      throw new Api400Error('Order product out of stock!')
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_news
    })

    // trường hợp: nếu insert thành công -> remove product có trong cart
    if (newOrder) {
      await cartModel.updateOne({ _id: cartId }, { $set: { cart_products: [] } })
    }

    return newOrder
  }

  /*
    1. Query Orders [Users]
  */
  static async getOrdersByUser() {}

  /*
    2. Query Order using Id [Users]
  */
  static async getOneOrderByUser() {}

  /*
    3. Cancel Order [Users]
  */
  static async cancelOrderByUser() {}

  /*
    4. Update Order Status [Shop | Admin]
  */
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService
