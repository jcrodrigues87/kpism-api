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
  closed: {
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
    closed: this.closed,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Period = mongoose.model('Period', PeriodSchema);

module.exports = Period;