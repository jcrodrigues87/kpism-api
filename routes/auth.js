const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

module.exports = (req, res, next) => {
  const token = getTokenFromHeader(req);

  jwt.verify(token, secret, (err, decoded) => {
    if (!err) {
      req.payload = {
        id: decoded.id,
        role: decoded.role
      }
    }

    return next();
  });
};

// const jwt = require('express-jwt');
// const secret = require('../config').secret;

// function getTokenFromHeader(req) {
//   console.log('veirificou token');
//   if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
//     return req.headers.authorization.split(' ')[1];
//   }

//   return null;
// }

// const auth = {
//   required: jwt({
//     secret: secret,
//     userProperty: 'payload',
//     getToken: getTokenFromHeader
//   }),
//   optional: jwt({
//     secret: secret,
//     userProperty: 'payload',
//     credentialsRequired: false,
//     getToken: getTokenFromHeader
//   })
// };

// module.exports = auth;