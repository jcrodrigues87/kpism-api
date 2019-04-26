const mongoose = require('../config/database');

const MeteringSchema = new mongoose.Schema({
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, "can't be blank"]
  },
  indicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator',
    required: [true, "can't be blank"]
  },
  refOrder: {
    type: Number
  },
  refName: {
    type: String
  },
  target: {
    type: Number,
    required: [true, "can't be blank"]
  },
  actual: {
    type: Number,
    required: [true, "can't be blank"]
  },
  difference: {
    type: Number,
    required: [true, "can't be blank"]
  },
  percent: {
    type: Number,
    required: [true, "can't be blank"]
  }
}, { timestamps: true });

MeteringSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    period: this.period ? this.period.toCrudJSON() : undefined,
    indicator: this.indicator ? this.indicator.toCrudJSON() : undefined,
    refOrder: this.refOrder,
    refName: this.refName,
    target: this.target,
    actual: this.actual,
    difference: this.difference,
    percent: this.percent,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Metering = mongoose.model('Metering', MeteringSchema);

module.exports = Metering;