const router = require('express').Router();
const User = require('../../models/User');
const Department = require('../../models/Department');
const mailer = require('../../modules/mailer');

populateUser = async user => {
  if (user.department && user.department.childOf)
    user.department.childOf = await Department.findById(user.department.childOf);

  if (user.department && user.department.manager)
    user.department.manager = await User.findById(user.department.manager);  
  
  return user;
}

// create a new user, access by admin only
router.post('/', async (req, res, next) => {
  try {
    const user = new User(req.body.user);

    if (req.body.user.department && req.body.user.department.id)
      user.department = await Department.findById(req.body.user.department.id).populate(['manager','childOf']);
    else
      user.department = undefined;

    const password = user.getRandomPassword(6)

    user.setPassword(password);

    await user.save();

    mailer.sendMail({
      to: user.email,
      from: 'admin@company.com',
      template: 'new_user',
      context: { password }
    }, (err) => {
      if (err) {
        return res.json({
          user: user.toCrudJSON(),
          errors: {
            message: "E-mail inicial não enviado ao usuário"
          }
        });
      }

      return res.json({ user: user.toCrudJSON() });
    });
  } catch (err) {
    return next(err);
  }
});

// update user data, acces by admin only
router.put('/:userId', async (req, res, next) => {
  try {
    //const user = await User.findByIdAndUpdate(req.params.userId, req.body.user, { new: true, runValidators: true });
    const user = await User.findById(req.params.userId).populate(['department']);

    if (user) {
      const { name, email, department, role, inactive } = req.body.user;

      if (name !== undefined)
        user.name = name;
      
      if (email !== undefined)
        user.email = email;

      if (role !== undefined) 
        user.role = role;

      if (inactive !== undefined)
        user.inactive = inactive;

      if (department !== undefined)
        if (department && department.id)
          user.department = await Department.findById(department.id).populate(['manager','childOf']);
        else
          user.department = undefined;

      await user.save();

      return res.json({ user: user.toCrudJSON() });
    } else {
      Object.assign(user, req.body.user);

      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get user data, access by admin only
router.get('/:userId', async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userId).populate(['department']);

    user = await populateUser(user);

    if (user)
      return res.json({ user: user.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// get query users, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({inactive: false}).populate(['department']);

    for (let i = 0; i < users.length; i++) {
      users[i] = await populateUser(users[i]);
    }

    return res.json({ users: users.map(user => user.toCrudJSON()) });
  } catch (err) {
    return next(err);
  }
});

// delete user data, access by admin only
router.delete('/:userId', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate({_id: req.params.userId}, {inactive: true});

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;