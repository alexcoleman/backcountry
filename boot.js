require('./config/env');

APP_ROOT = __dirname;

var express = require('express'),
    config = require('config'),
    fs = require('fs'),
    hoganEngine = require('hogan-engine'),
    mongo= require('mongoskin');

var app = module.exports = express();
app.db_url = 'mongodb://rumgr:egaragesale@dharma.mongohq.com:10029/sherpa';
app.db = mongo.db(app.db_url+'?auto_reconnect=true')


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