const router = require('express').Router();
const Department = require('../../models/Department');
const User = require('../../models/User');
const Indicator = require('../../models/Indicator');
const Responsable = require('../../models/Responsable');
const Metering = require('../../models/Metering');
const BasketItem = require('../../models/BasketItem');

// delete a list of indicators that have this department
deleteIndicators = async (department) => {
  const indicators = await Indicator.find({department: department._id}) // find all indicators of that department
  for (var i in indicators) { // for each indicator, delete it
    const indi = await Indicator.findByIdAndRemove(indicators[i]._id) // if department is deleted, indicator of that department must be deleted too
    const responsable = await Responsable.deleteMany({indicator: indicators[i]._id}); // if indicator is deleted, responsable of that indicator must be deleted too
    const basketItemRef = await BasketItem.deleteMany({indicatorRef: indicators[i]._id}); // if indicator is deleted, the basket that it is root must be deleted too
    const basketItem = await BasketItem.deleteMany({indicator: indicators[i]._id}); // if indicator is deleted, the basket that it is leaf must be deleted too
    const metering = await Metering.deleteMany({indicator: indicators[i]._id}); // if indicator is deleted, the metering of that indicator must be deleted too
  }
}

// create a new department, access by admin only
router.post('/', async (req, res, next) => {
  try {
    const department = new Department(req.body.department);

    if (req.body.department.manager && req.body.department.manager.id) 
      department.manager = await User.findById(req.body.department.manager.id).populate(['department']);
    else 
      department.manager = undefined;

    if (req.body.department.childOf && req.body.department.childOf.id) 
      department.childOf = await Department.findById(req.body.department.childOf.id).populate(['manager','childOf']);
    else
      department.childOf = undefined;

    await department.save();

    return res.json({ department: department.toCrudJSON() });
  } catch (err) {
    return next(err);
  }
});

// update user department, acces by admin only
router.put('/:departmentId', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.departmentId).populate(['manager','childOf']);

    if (department) {
      const { name, description, manager, childOf } = req.body.department;

      if (name !== undefined)
        department.name = name;

      if (description !== undefined)
        department.description = description;

      if (manager !== undefined)
        if (manager && manager.id)
          department.manager = await User.findById(manager.id).populate(['department']);
        else
          department.manager = undefined;

      if (childOf !== undefined)
        if (childOf && childOf.id)
          department.childOf = await Department.findById(childOf.id).populate(['manager','childOf']);
        else
          department.childOf = undefined;

      await department.save();

      return res.json({ department: department.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get user department, access by admin only
router.get('/:departmentId', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.departmentId).populate(['manager','childOf']);

    if (department)
      return res.json({ department: department.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// delete user department, access by admin only
router.delete('/:departmentId', async (req, res, next) => {
  try {
    const department = await Department.findByIdAndRemove(req.params.departmentId);
    const user = await User.updateMany({department: department._id}, {$unset:{department: 1}}); // if department is deleted, that department field in user must be deleted
    await deleteIndicators(department)

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

// get query department, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find().populate(['manager','childOf']);

    return res.json({ departments: departments.map(department => department.toCrudJSON()) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;