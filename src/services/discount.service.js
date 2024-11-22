'use strict'

const { BadRequestError, NotFoundError } = require('@/core/error.response')
const discount = require('@/models/discount.model')
const { findAllDiscountCodesUnSelect } = require('@/models/repositories/discount.repo')
const { findAllProducts } = require('@/services/product.service')
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
    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new BadRequestError('Invalid date range!')
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError('Start date must be less than end date!')
    }

    // create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: discount_code,
        discount_shopId: convertToObjectIdMongodb(discount_shopId)
      })
      .lean()

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount code already exists!')
    }

    const newDiscount = await discount.create({
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

  static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId)
      })
      .lean()

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount code not found!')
    }

    const { discount_apply_to, discount_product_ids } = foundDiscount
    let products
    if (discount_apply_to === 'all') {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    if (discount_apply_to === 'specific') {
      // get specific products
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    return products
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discount
    })

    return discounts
  }
}
