var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine'),
    mongoose = require('mongoose'),
    Schema = mongoose.Types,
    ObjectId = Schema.ObjectId;;

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
  console.log(req.params.id)
  app.models.User.find({}, function (err, user) {
    context.user = user;
    console.log('found a user', err)
    res.render('user', context);
  })
});

/** Destination **/
app.get('/destination/:id', function (req, res, next) {
  var context = {
    page: {
      title: "Destination page"
    }
  };

  console.log('th eid:', req.params.id)
  app.models.User.findOne({_id: req.params.id}, function (err, destination) {
    console.log('error', err)
    context.destination = destination;
    console.log('found a destination', destination)
    res.render('destination', context);
  });

});

/** Destination **/
app.get('/api/search/destination/:term', function (req, res, next) {
  var context = {
    page: {
      title: "Destination page"
    }
  };

  res.render('destination', context);
});

/*
  var destination = {};
  var topGear = [
    {
      "season": "spring",
      "categories": [
        {"name":"Trekking Poles"},
        {"name":"Gloves"}
      ]
    },
    {
      "season": "summer",
      "categories": [
        {"name":"Trekking Poles"},
        {"name":"Gloves"}
      ]
    },
    {
      "season": "fall",
      "categories": [
        {"name":"Trekking Poles"},
        {"name":"Gloves"}
      ]
    },
    {
      "season": "winter",
      "categories": [
        {"name":"Trekking Poles"},
        {"name":"Gloves"}
      ]
    }
  ];
  
  destination.topGear;
  context.destination = destination;
  */