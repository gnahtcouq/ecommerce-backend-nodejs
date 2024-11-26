'use strict'

const cartModel = require('@/models/cart.model')
const { convertToObjectIdMongodb } = require('@/utils')

const findCartById = async (cartId) => {
  return await cartModel.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active' }).lean()
}

module.exports = {
  findCartById
}
