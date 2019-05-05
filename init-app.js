const User = require('./models/User');

async function start() {
  const user = new User();

  const defaultPassword = 'admin';

  user.name = 'admin';
  user.email = 'admin@company.com';
  user.role = 'admin';
  user.setPassword('admin');

  await user.save();

  console.log('Username: ' + user.name);
  console.log('Login: ' + user.email);
  console.log('Password: ' + defaultPassword);
}

start();