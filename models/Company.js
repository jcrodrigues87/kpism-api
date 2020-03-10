const mongoose = require('../config/database');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, "can't be blank"]
  },
  multiplier: {
    type: Number,
    required: [true, "can't be blank"]
  }
}, { timestamps: true });

CompanySchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    period: this.period ? this.period.toCrudJSON() : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;