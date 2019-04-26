const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/departments', require('./departments'));
router.use('/indicators', require('./indicators'));
router.use('/periods', require('./periods'));
router.use('/charts', require('./charts'));
router.use('/auth', require('./authentication'));
router.use('/profiles', require('./profiles'));

// catch validation errors
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
})

module.exports = router;