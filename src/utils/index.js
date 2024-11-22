'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = (id) => Types.ObjectId(id)

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

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => obj[key] === null && delete obj[key])
  return obj
}

// const updateNestedObjectParser = (obj) => {
//   // console.log(`[1]::`, obj)
//   const final = {}
//   Object.keys(obj || {}).forEach((key) => {
//     if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
//       const res = updateNestedObjectParser(obj[key])
//       Object.keys(res || {}).forEach((a) => {
//         final[`${key}.${a}`] = res[a]
//       })
//     } else {
//       final[key] = obj[key]
//     }
//   })
//   // console.log(`[2]::`, final)
//   return final
// }

const updateNestedObjectParser = (obj, prefix = '') => {
  const result = {}
  Object.keys(obj).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (obj[key] === null || obj[key] === undefined) {
      console.log(`ingore key`, key)
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(result, updateNestedObjectParser(obj[key], newKey))
    } else {
      result[newKey] = obj[key]
    }
  })

  return result
}

module.exports = {
  convertToObjectIdMongodb,
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser
}
