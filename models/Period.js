const mongoose = require('../config/database');

const TaxSchema = new mongoose.Schema({
  ceiling: {
    type: Number,
    default: 0
  },
  percent: {
    type: Number,
    default: 0
  },
  deduction: {
    type: Number,
    default: 0
  }
});

const PeriodSchema = new mongoose.Schema({
  year: {
    type: String,
    required: [true, "Ano não pode ser vazio"]
  },
  companyMultiplier: {
    type: Number,
    default: 0
  },
  tax: {
    type: [ TaxSchema ]
  },
  closed: {
    type: Boolean,
    default: false
  },
  closedMonth: {
    type: Number,
    default: 0
  },
  inactive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

PeriodSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    year: this.year,
    companyMultiplier: this.companyMultiplier,
    tax: this.tax, 
    closed: this.closed,
    closedMonth: this.closedMonth,
    inactive: this.inactive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Period = mongoose.model('Period', PeriodSchema);

module.exports = Period;