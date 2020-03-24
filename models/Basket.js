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
  basketItems: {
    type: [ BasketItemSchema ]
  }
}, { timestamps: true });

BasketSchema.methods.toCrudJSON = function() {
  var basketItemList = [];
  for (var i = 0; i < this.basketItems.length; i++) {
    basketItemList.push(
      {
        id: this.basketItems[i]._id,
        weight: this.basketItems[i].weight,
        indicator: this.basketItems[i].indicator.toBasketJSON()
      }
    )
  }
  return {
    id: this.id,
    indicatorRef: this.indicatorRef,
    basketItems: basketItemList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Basket = mongoose.model('Basket', BasketSchema);

module.exports = Basket;