const mongoose = require('../config/database');

const ContractIndicatorSchema = new mongoose.Schema({
  indicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "Indicador não pode ser vazio"]
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, "Contrato não pode ser vazio"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Usuário não pode ser vazio"]
  },
  weight: {
    type: Number,
    required: [true, "Peso não pode ser vazio"]
  },
}, { timestamps: true });

ContractIndicatorSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    indicator: this.indicator.toCrudJSON(),
    contract: this.contract.id,
    user: this.user.id,
    weight: this.weight,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const ContractIndicator = mongoose.model('ContractIndicator', ContractIndicatorSchema);

module.exports = ContractIndicator;