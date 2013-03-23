require('./config/env');

APP_ROOT = __dirname;

var express = require('express'),
    config = require('config'),
    fs = require('fs'),
    hoganEngine = require('hogan-engine'),
    mongoose = require('mongoose');

var app = express();
app.mongoose = mongoose;
var db = config.db;
app.db_url = 'mongodb://rumgr:egaragesale@dharma.mongohq.com:10029/sherpa';

console.log(app.db_url);
app.mongoose.connect(app.db_url);

/** Setup models **/
var models = {}
  , models_path = __dirname + '/models'
  , model_files = fs.readdirSync(models_path);

model_files.forEach(function(file) {
  if(file[0]=='.'){
    return;
  }
  var modelName = file.split('.')[0];
  var m = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  models[m] = require('./models/'+modelName)(app.mongoose).model;
});

app.models = models;

EXPRESS_APP = app;

// configure the application
hoganEngine.root = __dirname + '/templates';
hoganEngine.cache = app.get('view cache');

app.engine('html', hoganEngine);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public', {}));

// routes
require('./routes');

app.listen(process.env.PORT);
console.log('Web server listening on port: 9000');