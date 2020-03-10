const mongoose = require('../config/database');

const IndicatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  description: {
    type: String,
    required: [true, "can't be blank"]
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, "can't be blank"]
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, "can't be blank"]
  },
  measure: {
    type: String,
    required: [true, "can't be blank"]
  },
  accumulatedType: {
    type: String,
    required: [true, "can't be blank"],
    lowercase: true,
    enum: ['sum','avg','equalsref']
  },
  orientation: {
    type: String,
    required: [true, "can't be blank"],
    lowercase: true,
    enum: ['higher','lower']
  },
  basket: {
    type: Boolean,
    default: false
  },
  metering: [
    {
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
    }
  ],
}, { timestamps: true });

IndicatorSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    period: this.period ? this.period.toCrudJSON() : undefined,
    department: this.department ? { id: this.department.id, name: this.department.name } : undefined,
    measure: this.measure,
    accumulatedType: this.accumulatedType,
    orientation: this.orientation,
    basket: this.basket,
    metering: this.metering,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Indicator = mongoose.model('Indicator', IndicatorSchema);

module.exports = Indicator;