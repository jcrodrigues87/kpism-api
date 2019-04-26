const router = require('express').Router();
const User = require('../../models/User');
const Department = require('../../models/Department');
const mailer = require('../../modules/mailer');

profilePopulateUser = async user => {
  if (user.department && user.department.childOf)
    user.department.childOf = await Department.findById(user.department.childOf);

  if (user.department && user.department.manager)
    user.department.manager = await User.findById(user.department.manager);  
  
  return user;
}

// update user profile data
router.put('/', async (req, res, next) => {
  try {
    let user = await User.findById(req.payload.id).populate(['department']);

    if (user) {
      const { name, email } = req.body.user;

      if (name !== undefined)
        user.name = name;
      
      if (email !== undefined)
        user.email = email;

      await user.save();

      user = await profilePopulateUser(user);

      return res.json({ user: user.toProfileJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get user profile data
router.get('/:userId', async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userId).populate(['department']);

    if (user) {
      user = await profilePopulateUser(user);

      return res.json({ user: user.toProfileJSON() });
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// get query users profile data
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().populate(['department']);

    for (let i = 0; i < users.length; i++) {
      users[i] = await profilePopulateUser(users[i]);
    }

    return res.json({ users: users.map(user => user.toProfileJSON()) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;