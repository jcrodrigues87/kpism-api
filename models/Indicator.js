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
  basket: {
    type: Boolean,
    default: false
  },
  orientation: {
    type: String,
    required: [true, "can't be blank"],
    lowercase: true,
    enum: ['higher','lower']
  }
}, { timestamps: true });

IndicatorSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    measure: this.measure,
    department: this.department ? { id: this.department.id, name: this.department.name } : undefined,
    accumulatedType: this.accumulatedType,
    orientation: this.orientation,
    basket: this.basket,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Indicator = mongoose.model('Indicator', IndicatorSchema);

module.exports = Indicator;