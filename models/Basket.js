const mongoose = require('../config/database');

const BasketItemSchema = new mongoose.Schema({
  indicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  weight: {
    type: Number,
    required: [true, "can't be blank"]
  }
});

const BasketSchema = new mongoose.Schema({
  indicatorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  indicators: {
    type: [ BasketItemSchema ]
  }
}, { timestamps: true });

BasketSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    indicatorRef: this.indicatorRef,
    indicators: this.indicators,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Basket = mongoose.model('Basket', BasketSchema);

module.exports = Basket;