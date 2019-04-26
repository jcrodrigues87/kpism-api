const router = require('express').Router();
const Department = require('../../models/Department');
const User = require('../../models/User');

// create a new user, access by admin only
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

// update user data, acces by admin only
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

// get user data, access by admin only
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

// deçete user data, access by admin only
router.delete('/:departmentId', async (req, res, next) => {
  try {
    const department = await Department.findByIdAndRemove(req.params.departmentId);

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

// get query users, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find().populate(['manager','childOf']);

    return res.json({ departments: departments.map(department => department.toCrudJSON()) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;