const mongoose = require('../config/database');

const ContractSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "can't be blank"]
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, "can't be blank"]
  },
  salary: {
    type: Number,
    default: 0
  },
  proportionalPeriod: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  qualitative: {
    type: Number,
    default: 0
  },
  quantitative: {
    type: Number,
    default: 0
  },
  resultContract: {
    type: Number,
    default: 0
  },
  plr: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  finalPlr: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

ContractSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    period: this.period ? this.period.toCrudJSON() : undefined,
    user: this.user ? this.user.toProfileJSON() : undefined,
    salary: this.salary,
    proportionalPeriod: this.proportionalPeriod,
    bonus: this.bonus,
    qualitative: this.qualitative,
    quantitative: this.quantitative,
    resultContract: this.resultContract,
    plr: this.plr,
    tax: this.tax,
    finalPlr: this.finalPlr,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Contract = mongoose.model('Contract', ContractSchema);

module.exports = Contract;