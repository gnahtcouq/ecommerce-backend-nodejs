'use strict'

const { Api400Error, Api404Error } = require('@/core/error.response')
const discountModel = require('@/models/discount.model')
const { findAllDiscountCodesSelect } = require('@/models/repositories/discount.repo')
const { findAllProducts } = require('@/models/repositories/product.repo')
const { convertToObjectIdMongodb } = require('@/utils')

/*
  Discount Services
  1 - Generate Discount Code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [User | Shop]
  4 - Verify discount code [User]
  5 - Delete discount code [Shop | Admin]
  6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_users,
      user_count,
      user_uses,
      max_uses_per_user,
      min_order_value,
      shopId,
      is_active,
      apply_to,
      product_ids
    } = payload

    if (new Date(start_date) >= new Date(end_date)) {
      throw new Api400Error('Start date must be less than end date!')
    }

    // create index for discount code
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })

    if (foundDiscount) {
      throw new Api400Error('Discount code already exists!')
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_users: max_users,
      discount_user_count: user_count,
      discount_user_uses: user_uses,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_is_active: is_active,
      discount_apply_to: apply_to,
      discount_product_ids: apply_to === 'all' ? [] : product_ids
    })

    return newDiscount
  }

  static async updateDiscountCode() {}

  static async getAllDiscountCodesWithProduct({ codeId, shopId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new Api404Error('Discount code not found!')
    }

    const { discount_apply_to, discount_product_ids } = foundDiscount

    let filter
    if (discount_apply_to === 'all') {
      // get all products
      filter = {
        product_shop: convertToObjectIdMongodb(shopId),
        isPublished: true
      }
    }

    if (discount_apply_to === 'specific') {
      // get specific products
      filter = {
        _id: { $in: discount_product_ids },
        isPublished: true
      }
    }

    return await findAllProducts({
      filter,
      limit: +limit,
      page: +page,
      sort: 'ctime',
      select: ['product_name']
    })
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true
      },
      select: ['discount_name', 'discount_code'],
      model: discountModel
    })

    return discounts
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })

    if (!foundDiscount) throw new Api404Error('Discount code not found!')

    const {
      discount_is_active,
      discount_user_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_type,
      discount_value
    } = foundDiscount
    if (!discount_is_active) throw new Api400Error('Discount code has expired!')
    if (!discount_user_uses) throw new Api400Error('Discount code already used!')

    // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
    //   throw new Api400Error('Discount code has expired!')
    // }

    // check xem có xét giá trị tối thiểu hay không
    let totalOrder = 0
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, cur) => {
        return acc + cur.quantity * cur.price
      }, 0)

      if (totalOrder < discount_min_order_value) {
        throw new Api400Error(`Total order value is not enough! Min order value: ${discount_min_order_value}`)
      }
    }

    if (discount_max_uses_per_user > 0) {
      // check xem user đã sử dụng hết chưa
      const userUsed = discount_user_uses.find((user) => user === userId)
      if (userUsed) throw new Api400Error('You have already used this discount code!')
    }

    // check xem discount này là fixed amount hay percent
    const amount = discount_type === 'fixed_amount' ? discount_value : (discount_value / 100) * totalOrder

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  static async deleteDiscountCode({ code, shopId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })

    return deleted
  }

  static async cancelDiscountCode({ codeId, userId, shopId }) {
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })

    if (!foundDiscount) throw new Api404Error('Discount code not found!')

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: { discount_user_uses: userId },
      $inc: {
        discount_max_users: 1,
        discount_user_count: -1
      }
    })

    return result
  }
}

module.exports = DiscountService
