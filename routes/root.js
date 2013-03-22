var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine');

/** Home **/
app.get('/', function (req, res, next) {
  var context = {
    page: {
      title: "Hello world"
    }
  };

  res.render('home', context);
});

/** User **/
app.get('/user/:id', function (req, res, next) {
  var context = {
    page: {
      title: "User page"
    }
  };

  res.render('user', context);
});

/** Destination **/
app.get('/destination/:id', function (req, res, next) {
  var context = {
    page: {
      title: "Destination page"
    }
  };

  res.render('destination', context);
});