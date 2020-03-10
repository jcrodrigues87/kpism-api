const mongoose = require('../config/database');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  description: {
    type: String,
    required: [true, "can't be blank"]
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  childOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  inactive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

DepartmentSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    manager: this.manager ? { id: this.manager.id, name: this.manager.name } : undefined,
    childOf: this.childOf ? { id: this.childOf.id, name: this.childOf.name } : undefined,
    inactive: this.inactive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Department = mongoose.model('Department', DepartmentSchema);

module.exports = Department;