const mongoose = require('../config/database');

const ContractIndicatorSchema = new mongoose.Schema({
  indicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, "can't be blank"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "can't be blank"]
  },
  weight: {
    type: Number,
    required: [true, "can't be blank"]
  },
}, { timestamps: true });

ContractIndicatorSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    indicator: this.indicator.id,
    contract: this.contract.id,
    user: this.user.id,
    weight: this.weight,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const ContractIndicator = mongoose.model('ContractIndicator', ContractIndicatorSchema);

module.exports = ContractIndicator;