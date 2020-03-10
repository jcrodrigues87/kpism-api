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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
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
    indicator: this.indicator ? this.indicator.toCrudJSON() : undefined,
    contract: this.contract ? this.contract.toCrudJSON() : undefined,
    user: this.user ? this.user.toProfileJSON() : undefined,
    department: this.department ? { id: this.department.id, name: this.department.name } : undefined,
    weight: this.weight,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const ContractIndicator = mongoose.model('ContractIndicator', ContractIndicatorSchema);

module.exports = ContractIndicator;