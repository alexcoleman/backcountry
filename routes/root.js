var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine');

// Jeans
app.get('/', function (req, res, next) {
  var context = {
    page: {
      title: "Hello world"
    }
  };

  res.render('home', context);
});