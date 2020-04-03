const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (req.payload) 
      await User.findByIdAndUpdate(req.payload.id, { lastAccess: new Date() }, { new: true });
    return next();
  } catch(err) {
    return next(err);
  }
};