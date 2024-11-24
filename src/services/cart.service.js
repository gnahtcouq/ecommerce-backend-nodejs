'use strict'

const { BadRequestError, NotFoundError } = require('@/core/error.response')
const cart = require('@/models/cart.model')
const { findProduct } = require('@/models/repositories/product.repo')

/* Key features: Cart Service
  1. Add product to cart [User]
  2. Reduce product quantity by one [User]
  3. Increase product quantity [User]
  4. Get list to cart [User]
  5. Delete cart [User]
  6. Delete cart item [User]
*/

class CartService {
  /// START REPO CART ///
  static async createUserCart({ userId, product }) {
    const query = { cart_state: 'active', cart_userId: userId },
      updateOrInsert = {
        $addToSet: {
          cart_products: product
        }
      },
      options = { upsert: true, new: true }

    return await cart.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
      },
      updateSet = {
        $inc: {
          'cart_products.$.quantity': quantity
        }
      },
      options = { upsert: true, new: true }

    return await cart.findOneAndUpdate(query, updateSet, options)
  }
  /// END REPO CART ///

  static async addToCart({ userId, product = {} }) {
    // check cart exist
    const userCart = await cart.findOne({ cart_userId: userId, cart_state: 'active' })
    if (!userCart) {
      // create new cart
      return await this.createUserCart({ userId, product })
    }

    // if cart exist but product not exist
    if (userCart.cart_products.length === 0) {
      userCart.cart_products = [product]
      return await userCart.save()
    }

    // if cart exist and product exist -> increase quantity
    return await this.updateUserCartQuantity({ userId, product })
  }

  // update cart
  static async updateCartQuantity({ userId, shop_order_ids = [] }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
    // check product exist
    const foundProduct = await findProduct({ product_id: productId, unSelect: ['__v'] })
    if (!foundProduct) throw new NotFoundError('Product not found!')
    // compare quantity
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new BadRequestError('Product not belong to shop!')
    }

    if (quantity === 0) {
      // delete
    }

    return await this.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateSet = {
        $pull: {
          cart_products: { productId }
        }
      }
    const deleteCart = await cart.updateOne(query, updateSet)

    return deleteCart
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({ cart_userId: +userId, cart_state: 'active' }).lean()
  }
}

module.exports = CartService
