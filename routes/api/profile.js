const router = require('express').Router();
const User = require('../../models/User');

// update profile data, all can access
router.put('/', async (req, res, next) => {
  try {
    // allow modify just user data fields
    const { name, email } = req.body.user;

    const usr = {};

    if (typeof name !== 'undefined')
      usr.name = name;

    if (typeof email !== 'undefined')
      usr.email = email;

    const user = await User.findByIdAndUpdate(req.payload.id, usr, { new: true, runValidators: true });

    if (!user)
      return res.sendStatus(401);

    res.json({ user: user.toProfileJSON() });
  } catch (err) {
    return next(err);
  }
});

// get user profile data, all can access
router.get('/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    res.json({ user: user.toProfileJSON() });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;