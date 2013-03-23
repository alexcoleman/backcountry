var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine');

/** Home **/
app.get('/', function (req, res, next) {
  var context = {
    css: [{href: '/css/styles.css'}, {href: '/css/bootstrap.min.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}],
    page: {
      title: "Hello world"
    }
  };

  res.render('home', context);
});

/** User **/
app.get('/user/:id', function (req, res, next) {
  var context = {
    css: [{href: '/css/styles.css'}, {href: '/css/bootstrap.min.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}],
    page: {
      title: "User page"
    }
  };

  res.render('user', context);
});

/** Destination **/
app.get('/destination/:id', function (req, res, next) {
  var context = {
    css: [{href: '/css/styles.css'}, {href: '/css/bootstrap.min.css'}, {href: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'}, {src: '/js/mapCode.js'}, {src: '/js/destination.js'}],
    page: {
      title: "Destination page"
    }
  };

  res.render('destination', context);
});