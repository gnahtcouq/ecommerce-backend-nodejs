'use strict'

const { model, Schema } = require('mongoose')
const slugify = require('slugify')

const DOCUMENT_NAME = 'product'
const COLLECTION_NAME = 'products'

const productSchema = new Schema({
  product_name: { type: String, required: true },
  product_thumb: { type: String, required: true },
  product_description: String,
  product_slug: String,
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ['Electronic', 'Clothing', 'Furniture']
  },
  product_shop: { type: Schema.Types.ObjectId, ref: 'shop' },
  product_attributes: { type: Schema.Types.Mixed, required: true },
  product_ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be greater than 1'],
    max: [5, 'Rating must be less than 5'],
    set: (val) => Math.round(val * 10) / 10
  },
  product_variations: { type: Array, default: [] },
  isDraft: { type: Boolean, default: true, index: true, select: false },
  isPublished: { type: Boolean, default: false, index: true, select: false }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
})

// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// document middleware
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true })
  next()
})

// define the product type = clothing
const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'shop' }
}, {
  collection: 'clothes',
  timestamps: true
})

// define the product type = electronic
const electronicSchema = new Schema({
  manufacturer: { type: String, required: true },
  model: String,
  color: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'shop' }
}, {
  collection: 'electronics',
  timestamps: true
})

// define the product type = furniture
const furnitureSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'shop' }
}, {
  collection: 'furniture',
  timestamps: true
})

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothes', clothingSchema),
  electronic: model('Electronics', electronicSchema),
  furniture: model('Furniture', furnitureSchema)
}
