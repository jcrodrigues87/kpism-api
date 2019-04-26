const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user || !user.isValidPassword(password) || user.inactive)
      return done(null, false, { errors: { 'email or password': 'is invalid' } });

    return done(null, user);
  } catch(err) {
    done(err);
  }
}));