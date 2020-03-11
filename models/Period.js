const mongoose = require('../config/database');

const PeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  begin: {
    type: String,
    required: [true, "can't be blank"]
  },
  end: {
    type: String,
    required: [true, "can't be blank"]
  },
  companyMultiplier: {
    type: Number,
    default: 0
  },
  closed: {
    type: Boolean,
    default: false
  },
  inactive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

PeriodSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    begin: this.begin,
    end: this.end,
    companyMultiplier: this.companyMultiplier,
    closed: this.closed,
    inactive: this.inactive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Period = mongoose.model('Period', PeriodSchema);

module.exports = Period;