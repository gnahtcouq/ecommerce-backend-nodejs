'use strict'

const { getSelectData, unGetSelectData } = require('@/utils')

const findAllDiscountCodesSelect = async ({ limit = 50, page = 1, sort = 'ctime', filter, select, model }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 }
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec()
  return documents
}

const findAllDiscountCodesUnSelect = async ({ limit = 50, page = 1, sort = 'ctime', filter, unSelect, model }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 }
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean()
    .exec()
  return documents
}

module.exports = {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnSelect
}
