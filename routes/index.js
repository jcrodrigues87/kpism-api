const router = require('express').Router();
const acl = require('express-acl');
const auth = require('./auth');
const userlog = require('./loggin');

let configObj = {
  baseUrl: '/api',
  filename: 'acl.json',
  path: 'config',
  denyCallback: (res) => {
    return res.status(403).json({
      errors: {
        message: 'forbiden access'
      }
    });
  },
  decodedObjectName: 'payload',
  roleSearchPath: 'payload.role',
  defaultRole: 'anonymous'
}

acl.config(configObj);

//router.use(auth.optional);
router.use(auth);
router.use(acl.authorize);
router.use(userlog);
router.use('/api', require('./api'));

module.exports = router;