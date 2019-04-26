const mongoose = require('../config/database');

const BasketItemSchema = new mongoose.Schema({
  indicatorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  indicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  weight: {
    type: Number,
    required: [true, "can't be blank"]
  }
}, { timestamps: true });

BasketItemSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    //indicatorRef: this.indicatorRef ? this.indicatorRef.toCrudJSON() : undefined,
    indicator: this.indicator ? this.indicator.toCrudJSON() : undefined,
    weight: this.weight,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const BasketItem = mongoose.model('BasketItem', BasketItemSchema);

module.exports = BasketItem;