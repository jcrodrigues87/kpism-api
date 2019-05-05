const mongoose = require('mongoose');
const mongourl = require('./index').mongo.url;

mongoose.connect(mongourl, { useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

module.exports = mongoose;