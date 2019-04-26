const mongoose = require('../config/database');

const ResponsableSchema = new mongoose.Schema({
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "can't be blank"]
  }
}, { timestamps: true });

ResponsableSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    period: this.period ? this.period.toCrudJSON() : undefined,
    user: this.user ? this.user.toProfileJSON() : undefined,
    indicator: this.indicator ? this.indicator.toCrudJSON() : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Responsable = mongoose.model('Responsable', ResponsableSchema);

module.exports = Responsable;