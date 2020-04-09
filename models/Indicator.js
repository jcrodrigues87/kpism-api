const mongoose = require('../config/database');

const MeteringSchema = new mongoose.Schema({
    refOrder: {
      type: Number
    },
    refName: {
      type: String
    },
    target: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: 0
    },
    difference: {
      type: Number,
      default: 0
    },
    percent: {
      type: Number,
      default: 0
    },
    inactive: {
      type: Boolean,
      default: false
    }
});

const IndicatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nome não pode ser vazio"]
  },
  description: {
    type: String,
    required: [true, "Descrição não pode ser vazia"]
  },
  equation: {
    type: String,
    required: [true, "Equação não pode ser vazia"]
  },
  evaluation: {
    type: String,
    required: [true, "Instrumento de Aferição não pode ser vazio"]
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, "Período não pode ser vazio"]
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, "Departamento não pode ser vazio"]
  },
  measure: {
    type: String,
    required: [true, "Medida não pode ser vazia"]
  },
  accumulatedType: {
    type: String,
    required: [true, "Tipo de Acumulado não pode ser vazio"],
    lowercase: true,
    enum: ['sum','avg','equalsref']
  },
  orientation: {
    type: String,
    required: [true, "Orientação não pode ser vazia"],
    lowercase: true,
    enum: ['higher','lower']
  },
  classification: {
    type: String,
    required: [true, "Classificação não pode ser vazia"],
    lowercase: true,
    enum: ['strategic','tactical','operational']
  },
  limit: {
    type: Number,
    required: [true, "Limite não pode ser vazio"]
  },
  basket: {
    type: Boolean,
    default: false
  },
  metering: {
    type: [ MeteringSchema ]
  }  
}, { timestamps: true });

IndicatorSchema.methods.toCrudJSON = function() {
  var meteringList = [];
  for (var i = 0; i < this.metering.length; i++) {
    meteringList.push(
      {
        id: this.metering[i]._id,
        refOrder: this.metering[i].refOrder,
        refName: this.metering[i].refName,
        target: this.metering[i].target,
        actual: this.metering[i].actual,
        difference: this.metering[i].difference,
        percent: this.metering[i].percent,
        inactive: this.metering[i].inactive
      }
    )
  }
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    equation: this.equation,
    evaluation: this.evaluation,
    period: this.period.year ? { id: this.period.id, year: this.period.year } : undefined,
    department: this.department.name ? { id: this.department.id, name: this.department.name } : undefined,
    measure: this.measure,
    accumulatedType: this.accumulatedType,
    orientation: this.orientation,
    classification: this.classification,
    limit: this.limit,
    basket: this.basket,
    metering: meteringList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

IndicatorSchema.methods.toBasketJSON = function() {
  var meteringList = [];
  for (var i = 0; i < this.metering.length; i++) {
    meteringList.push(
      {
        id: this.metering[i]._id,
        refOrder: this.metering[i].refOrder,
        refName: this.metering[i].refName,
        target: this.metering[i].target,
        actual: this.metering[i].actual,
        difference: this.metering[i].difference,
        percent: this.metering[i].percent,
        inactive: this.metering[i].inactive
      }
    )
  }
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    equation: this.equation,
    evaluation: this.evaluation,
    measure: this.measure,
    accumulatedType: this.accumulatedType,
    orientation: this.orientation,
    classification: this.classification,
    limit: this.limit,
    basket: this.basket,
    metering: meteringList,
  }
}

const Indicator = mongoose.model('Indicator', IndicatorSchema);

module.exports = Indicator;