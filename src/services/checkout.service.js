'use strict'

const { findCartById } = require('@/models/repositories/cart.repo')
const { BadRequestError, NotFoundError } = require('@/core/error.response')
const { checkProductByServer } = require('@/models/repositories/product.repo')
const { getDiscountAmount } = require('@/services/discount.service')

class CheckoutService {
  // login and without login
  /*
    {
      cartId,
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discounts: [],
          item_products: [
            {
              price,
              quantity,
              productId
            }
          ]
        },
        {
          shopId,
          shop_discounts: [
            {
              shopId,
              discountId,
              codeId
            }
          ],
          item_products: [
            {
              price,
              quantity,
              productId
            }
          ]
        }
      ]
    }
  */
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cartid exist
    const foundCart = await findCartById(cartId)
    if (!foundCart) throw new NotFoundError('Cart not found!')

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
      if (!checkProductServer[0]) throw new BadRequestError('Order product not available!')

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
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
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
}

module.exports = CheckoutService
