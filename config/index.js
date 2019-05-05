const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  secret: process.env.SECRET,
  environment: process.env.NODE_ENV,
  mongo: {
    url: process.env.MONGO_URL
  },
  mail: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}