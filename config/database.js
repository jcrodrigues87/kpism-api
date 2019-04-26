const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/kpism', { useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

module.exports = mongoose;