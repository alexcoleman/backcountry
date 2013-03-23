var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine'),
    _ = require('underscore'),
    async = require('async'),
    request = require('request');

/** Home **/
app.get('/', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/home.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}],
    page: {
      title: "Hello world"
    }
  };

  res.render('home', context);
});

/** User **/
app.get('/user/:username', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/user.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}],
    page: {
      title: "User page"
    }
  };
  
  async.parallel({
    user: function (callback) {
      app.db.collection('users').findOne({username: req.params.username}, function (err, user) {
        console.log(user)
        user.hasReviews = user && user.reviews && user.reviews.length>1 ? true : false;
        user.hasSuggestedGear = user.suggestedGear && user.suggestedGear.length>1 ? true : false;
    
        callback(null, user);
      });
    },
    activities: function (callback) {
      app.db.collection('activities').find({$or: [{username: req.params.username}, {$in: {friendIds: req.params.username}}]}).toArray(function (err, acts) {

        console.log(acts)
        
        callback(null, acts);
      });
    }
  },
  function (err, results) {
      context.user = results.user;

      context.hasActivity = results.activities && results.activities.length>1 ? true : false;
      context.activities = results.activities;
      res.render('user', context);
    
  });
});

app.get('/destination/:nameUrl', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/destination.css'}, {href: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'}, {src: '/js/mapCode.js'}, {src: '/js/destination.js'}],
    page: {
      title: "Destination page"
    }
  };
  
  app.db.collection('destinations').findOne({nameUrl: req.params.nameUrl}, function (err, destination) {
    var topGuides = _.chain(destination.participants)
     .sortBy(function(p) {return p.count})
     .rest(destination.participants.length-3)
     .reverse()
     .value();


    
    destination.topGuides = topGuides;
    destination.areTopGuides = function () {
      return this.topGuides.length;
    };
    destination.addlGuides = destination.participants.length - destination.topGuides.length;
    
    destination.seasonalGear = function () {
      return this.topGear.length;
    };
    context.destination = destination;
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