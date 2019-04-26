const router = require('express').Router();
const User = require('../../models/User');
const passport = require('passport');
const mailer = require('../../modules/mailer');
const crypto = require('crypto');

router.get('', async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id).populate(['department']);

    if (!user)
      res.sendStatus(401);

    return res.json({ user: user.toAuthJSON() });
  } catch(err) {
    return next(err);
  }
  
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body.user;

  if (!email)
    return res.status(422).json({ errors: { email: "can't be bland" } });

  if (!password)
    return res.status(422).json({ errors: { password: "can't be blank" } });

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err)
      return next(err);

    if (user) {
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

// register a new user
router.post('/register', async (req, res, next) => {
  try {
    const user = new User(req.body.user);
    const { key } = req.body;

    if (key !== 'oparin')
      return res.status(403).json({ errors: {
        message: 'operation not permited'
      }});

    if (req.body.user.department && req.body.department.id)
      user.department = await Department.findById(req.body.department.id).populate(['manager','childOf']);
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
            message: 'welcome email not sent to user'
          }
        });
      }

      return res.json({ user: user.toCrudJSON() });
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/forgot_password', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).populate(['department']);

    if (!user)
      return res.status(404).json({
        errors: {
          email: "email not found"
        }
      });

    const token = crypto.randomBytes(20).toString('hex');

    const expires = new Date();
    expires.setTime(expires.getTime() + (3600000));

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;

    user.save();

    mailer.sendMail({
      to: email,
      from: 'admin@company.com',
      template: 'forgot_password',
      context: { token }
    }, (err) => {
      if (err) {
        return res.json({
          errors: {
            message: "forgot password email not sent to user"
          }
        });
      }

      return res.send();
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate(['department']);

    if (!user)
      return res.status(404).json({
        errors: {
          message: "email not found"
        }
      });

    if (token !== user.passwordResetToken)
      return res.status(401).json({
        errors: {
          message: "invalid token"
        }
      });

      if (!password)
      return res.status(422).json({
        errors: {
          password: "can't be blank"
        }
      });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).json({
        errors: {
          message: "token expired, generate a new one"
        }
      });

    user.setPassword(password);

    console.log({user});

    await user.save();

    res.send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;