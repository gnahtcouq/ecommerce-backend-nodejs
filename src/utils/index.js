'use strict'

const _ = require('lodash')

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

// ['a', 'b', 'c'] => { a: 1, b: 1, c: 1 }
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((field) => [field, 1]))
}

// ['a', 'b', 'c'] => { a: 0, b: 0, c: 0 }
const unGetSelectData = (unSelect = []) => {
  return Object.fromEntries(unSelect.map((field) => [field, 0]))
}

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData
}
