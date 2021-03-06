var express = require('express'),
    app = EXPRESS_APP,
    hoganEngine = require('hogan-engine'),
    _ = require('underscore'),
    async = require('async'),
    howlong = require('howlong'),
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
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: '/js/user.js'}],
    page: {
      title: "User page"
    }
  };
  
  async.parallel({
    user: function (callback) {
      app.db.collection('users').findOne({username: req.params.username}, function (err, user) {
        user.hasReviews = user && user.reviews && user.reviews.length>0 ? true : false;
        user.hasSuggestedGear = user.suggestedGear && user.suggestedGear.length>0 ? true : false;
    
        callback(null, user);
      });
    },
    stats: function (callback) {
      app.db.collection('activities')
            .find({$or: [{username: req.params.username}, {friendIds: {$in: [req.params.username]}}]})
            .sort('date', -1)
            .toArray(function (err, acts) {
              
        for (var i=0; i<acts.length; i++) {
          var act = acts[i];
          // Fill out data for activity feed
          if (act.friends && act.friends.length>0) {
            if ( !(act.username == req.params.username) ) {
              var shownFriends = new Array();
              for (var j=0; j<act.friends.length; j++) {
                var friend = act.friends[j];
                if ( !(friend.username == req.params.username) ) {
                  shownFriends.push(friend);
                }
              }
              shownFriends.push({name: act.name, username: act.username, profile_img_url: act.profile_img_url});
              act.friends = shownFriends;
            }
            act.hasFriends = true;
          }
        }
        
        var data = {};
        data.activities = acts;
        data.topMonths = _.countBy(acts, function(act) {
          return act.date ? act.date.getMonth() : 0;
        });
        data.topYears = _.countBy(acts, function(act) {
          return act.date.getFullYear();
        });
        var hikeCounts = _.countBy(acts, function(act) {
          return act.destinationUrl;
        });
        
        var orderedHikes = new Array();
        for(key in hikeCounts) {
          orderedHikes.push({nameUrl: key, count: hikeCounts[key]})
        }
        orderedHikes = _.sortBy(orderedHikes, 'count').reverse();
         
        var topHikes = orderedHikes;
        if (topHikes && topHikes.length > 3) {
          topHikes = _.first(topHikes, 3);
        }
        
        data.topHikes = topHikes;
        data.topHike = data.topHikes ? data.topHikes[0] : null;
         
        app.db.collection('destinations').find({nameUrl : {$in: _.pluck(orderedHikes, 'nameUrl')}}).toArray(function (err, destinations) {
          // for each tophike, insert the addl data;
          var hikes = new Array();
          
          var sumElevationGain = 0;
          var sumDistance = 0;
          for(var i=0; i<orderedHikes.length; i++) {
            var hike = orderedHikes[i];
            var destination = _.find(destinations, function(d) {
              return d.nameUrl == hike.nameUrl;
            });
            hike.name = destination.name;
            hike.elevationGain = Math.abs(destination.elevationGain);
            hike.distance = destination["length"];
            hikes.push(hike);
            
            sumElevationGain += hike.elevationGain * hike.count;
            sumDistance += hike.distance * hike.count;
          }
          
          data.sumElevationGain = sumElevationGain;
          data.sumDistance = Math.round(sumDistance * 10)/10;
          callback(null, data);
        });
        
      });
    }
  },
  function (err, results) {
      context.user = results.user;
      context.stats = results.stats;
      context.activities = results.stats.activities;
      context.hasActivity = context.activities && context.activities.length>0 ? true : false;
      context.prettyDate = function () {
        return howlong.ago(this.date);
      };

      context.page.title = results.user.first_name +' '+results.user.last_name;
      context.isCrystal = function () {
        return this.user.username === 'crystalchang';
      };
      res.render('user', context);
    
  });
});

app.get('/sherpa/signup', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/sherpa.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: '/js/sherpa.js'}],
    page: {
      title: "Become a Sherpa!"
    }
  };

  res.render('sherpa', context);
});

app.get('/destination/:nameUrl', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/destination.css'}, {href: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'}, {src: '/js/mapCode.js'}, {src: '/js/destination.js'}],
    page: {
      title: "Destination page"
    }
  };
  
  async.parallel({
    destination: function (callback) {
      app.db.collection('destinations').findOne({nameUrl: req.params.nameUrl}, function (err, destination) {
        destination.seasonalGear = function () {
          return this.topGear.length;
        };
        callback(err, destination);
      });
  
    },
    topGuides: function (callback) {
      app.db.collection('activities').find({destinationUrl: req.params.nameUrl}).toArray(function (err, acts) {
        var counts = {};
        for (var i=0; i<acts.length; i++) {
          var act = acts[i];
          if (!counts[act.username]) {
            counts[act.username] = {name: act.name, username: act.username, count:0}
          }
          counts[act.username].count += 1;
          
          if (act.friends && act.friends.length>0) {
            for (var j=0; j<act.friends.length; j++) {
              var friend = act.friends[j];
              if (!counts[friend.username]) {
                counts[friend.username] = {name: friend.name, username: friend.username, count:0}
              }
              counts[friend.username].count += 1;
            }
          }
        }
        var guides = new Array();
        for(count in counts) {
          guides.push(counts[count]);
        }

        var topGuides = _.chain(guides)
         .sortBy(function(p) {return p.count})
         .reverse()
         .value();
         
        if (topGuides && topGuides.length > 3) {
          topGuides = _.first(topGuides, 3);
        }
        
         async.map(topGuides,
         function(item, callback) {
           app.db.collection('users').findOne({username: item.username}, function (err, user) {
             item.profile_img_url = user.profile_img_url;
             callback (err, item);
           });
         }, 
         function(err, results) {
           callback(err, results);
         })
      });
  
    }/*,
    products: function (callback) {
      app.db.collection('destinations').findOne({nameUrl: req.params.nameUrl}, function (err, destination) {
        var categories = new Array();
        destination.topGear.forEach(function (element) {
          categories.push(element.category.replace(' ', '+'));
        });

        var fetch = function (category, callback) {
          var requestOptions = {
            url: 'http://hackathon.backcountry.com:8080/hackathon/public/search?q=' + category,
            method: 'GET',
            json: 'true'
          };
          request(requestOptions, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              callback(null, body);
            }
            else {
              callback(err);
            }
          });
        }

        var products = [];
        async.map(categories, fetch, function (err, res) {
          if(!err) {
            res.forEach(function (element, index) {
              var cat = [];
              if(res[index]) {
                cat.push(res[index].products[0]);
                cat.push(res[index].products[1]);
                cat.push(res[index].products[2]);
                cat.push(res[index].products[3]); //DO IT LIVE
              }
              products.push({index: index + 1, category: categories[index].replace('+', ' '), items: cat});
            });
          }
          callback(err, products);
        });
      });
    }*/
  },
  function (err, results) {
    context.destination = results.destination;
    context.topGuides = results.topGuides;
    context.addlGuides = results.topGuides && results.topGuides.length - results.topGuides.length;
    context.areTopGuides = results.topGuides && results.topGuides.length>0;
    //context.products = results.products;

    //Temporary hack to remove the need for the Backcountry API
    context.products = [
      {
        index: 1,
        category: 'Trekking Poles',
        items:
        [
          { 
            id: 'BLD1280',
            displayName: 'Ultra Distance Trekking Pole',
            description: 'When weight is major concern because the lighter your gear the more mashed potato flakes you can pack, then you\'ll want the Black Diamond Ultra Distance Trekking Poles in your hands.',
            brand: '14',
            defaultSeoUrl: 'store/browse/productDetail.jsp?productId=BLD1280',
            questionCount: 3,
            imageCount: 3,
            reviewCount: 14,
            brandName: 'Black Diamond',
            brandAndDisplayName: 'Black Diamond Ultra Distance Trekking Pole',
            imageLarge:
             { name: '',
               url: 'http://content.backcountry.com/images/items/medium/BLD/BLD1280/ONECOL.jpg' },
            priceDisplay: '$119.96',
            availableColors: [ 'black' ],
            ratingUrl: 'http://content.backcountry.com/images/bcs/review/search/rating_4.png',
            averageReviewRating: '4.0',
            onSale: false,
            lowListPrice:
             { zero: false,
               currency: 'USD',
               amount: 149.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            lowSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 119.96,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highListPrice:
             { zero: false,
               currency: 'USD',
               amount: 149.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 119.96,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            quantityOnHand: 52,
            thumbnailImage:
             { name: '',
               url: 'http://content.backcountry.com/images/items/small/BLD/BLD1280/ONECOL.jpg' },
            discountPercent: 20 
          }
        ]
      },
      {
        index: 2,
        category: 'Hydration Packs',
        items:
        [
          { 
            id: 'DAK2227',
            displayName: 'Nomad Hydration Pack - 1100cu in',
            description: 'Dakine\'s Nomad Hydration Pack is fully stocked with features for trail and freeride mountain biking, and its three-liter bladder keeps you quenched during all-day rides.',
            brand: '23',
            defaultSeoUrl: 'store/browse/productDetail.jsp?productId=DAK2227',
            reviewCount: 1,
            brandName: 'DAKINE',
            brandAndDisplayName: 'DAKINE Nomad Hydration Pack - 1100cu in',
            imageLarge:
             { name: '',
               url: 'http://content.backcountry.com/images/items/medium/DAK/DAK2227/RD.jpg' },
            priceDisplay: '$76.97 - $91.96',
            availableColors: [ 'green', 'blue', 'black', 'gray', 'red' ],
            ratingUrl: 'http://content.backcountry.com/images/bcs/review/search/rating_5.png',
            averageReviewRating: '4.5',
            onSale: false,
            lowListPrice:
             { zero: false,
               currency: 'USD',
               amount: 109.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            lowSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 76.97,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highListPrice:
             { zero: false,
               currency: 'USD',
               amount: 114.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 91.96,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            quantityOnHand: 223,
            thumbnailImage:
             { name: '',
               url: 'http://content.backcountry.com/images/items/small/DAK/DAK2227/RD.jpg' },
            discountPercent: 30
          }
        ]
      },
      {
        index: 3,
        category: 'Gloves',
        items:
        [
          {
            id: 'PWG0085',
            displayName: 'Stealth GTX Glove',
            description: 'The Pow Stealth GTX Glove provides versatile, low-profile hand protection for mid-winter rope-ducking missions.',
            brand: '100000516',
            defaultSeoUrl: 'store/browse/productDetail.jsp?productId=PWG0085',
            reviewCount: 5,
            brandName: 'Pow Gloves',
            brandAndDisplayName: 'Pow Gloves Stealth GTX Glove',
            imageLarge:
             { name: '',
               url: 'http://content.backcountry.com/images/items/medium/PWG/PWG0085/RAS.jpg' },
            priceDisplay: '$69.97 - $99.95',
            availableColors: [ 'black', 'red' ],
            ratingUrl: 'http://content.backcountry.com/images/bcs/review/search/rating_5.png',
            averageReviewRating: '4.6',
            onSale: false,
            lowListPrice:
             { zero: false,
               currency: 'USD',
               amount: 99.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            lowSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 69.97,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highListPrice:
             { zero: false,
               currency: 'USD',
               amount: 99.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 99.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            quantityOnHand: 38,
            thumbnailImage:
             { name: '',
               url: 'http://content.backcountry.com/images/items/small/PWG/PWG0085/RAS.jpg' },
            discountPercent: 30
          }
        ]
      },
      {
        index: 4,
        category: 'Dry Sacks',
        items:
        [
          {
            id: 'ODR0761',
            displayName: 'Double Dry Window Sack',
            description: 'Stash your GPS, cell phone, and small essentials inside the Outdoor Research Double Dry Window Sack when you need waterproof storage as you raft or kayak on big water.',
            brand: '100000248',
            defaultSeoUrl: 'store/browse/productDetail.jsp?productId=ODR0761',
            questionCount: 1,
            reviewCount: 2,
            brandName: 'Outdoor Research',
            brandAndDisplayName: 'Outdoor Research Double Dry Window Sack',
            imageLarge:
             { name: '',
               url: 'http://content.backcountry.com/images/items/medium/ODR/ODR0761/MAR.jpg' },
            priceDisplay: '$25.46 - $36.51',
            availableColors: [ 'blue', 'gray', 'red' ],
            ratingUrl: 'http://content.backcountry.com/images/bcs/review/search/rating_5.png',
            averageReviewRating: '5.0',
            onSale: false,
            lowListPrice:
             { zero: false,
               currency: 'USD',
               amount: 29.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            lowSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 25.46,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highListPrice:
             { zero: false,
               currency: 'USD',
               amount: 42.95,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            highSalePrice:
             { zero: false,
               currency: 'USD',
               amount: 36.51,
               roundingStyle: 'HALF_EVEN',
               plus: true,
               minus: false },
            quantityOnHand: 83,
            thumbnailImage:
             { name: '',
               url: 'http://content.backcountry.com/images/items/small/ODR/ODR0761/MAR.jpg' },
            discountPercent: 15
          }
        ]
      }
    ];
    context.products.forEach(function (element, index) {
      context.products[index].items.push(context.products[index].items[0]);
      context.products[index].items.push(context.products[index].items[0]);
      context.products[index].items.push(context.products[index].items[0]);
    });

    context.page.title = results.destination.name;
    res.render('destination', context);
  });

});

/** Destination **/
app.get('/destinations', function (req, res, next) {
  
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/destinations.css'}, {href: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'}, {src: '/js/mapCode.js'}, {src: '/js/destination.js'}],
    page: {
      title: "Destinations"
    }
  };
  
  app.db.collection('destinations').find().sort('name', 1).toArray(function (err, destinations) {
    context.destinations = destinations;
    res.render('destinations', context);
  });
});

/** Add Activity **/
app.get('/activity', function (req, res, next) {
  var context = {
    css: [{href: '/css/bootstrap.min.css'}, {href: '/css/styles.css'}, {href: '/css/destinations.css'}, {href: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css'}],
    js: [{src: '/js/jquery.min.js'}, {src: '/js/modernizr.min.js'}, {src: '/js/bootstrap.js'}, {src: 'http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'}, {src: '/js/mapCode.js'}, {src: '/js/destination.js'}],
    page: {
      title: "Form"
    }
  };
  res.render('form', context);
})

app.post('/activity/:username', function (req, res, next) {
  var act = {
    userId: "514d2303a12e6b1a017ecf2a",
    name: "Crystal Chang",
    username: "crystalchang",
    profile_img_url: "http://www.rumgr.com/wp-content/themes/rumgr-17/img/headshot-charles.jpg",
    date: new Date(2013, 3, 22),
    destinationId: "514d2b0ac39d7232f80003c2",
    destinationName: "Angel's Landing",
    destinationUrl: "angels-landing",
    friendIds: [
      "dylanbathurst", "charleswatkins", "alexcoleman"
    ],
    friends: [
    {
      name: "Charles Watkins",
      username: "charleswatkins",
      profile_img_url: "http://www.rumgr.com/wp-content/themes/rumgr-17/img/headshot-charles.jpg"
    },
      {
        name: "Dylan Bathurst",
        username: "dylanbathurst",
  profile_img_url: "http://localhost:9000/img/profile-dylan.jpg"
      },
      {
        name: "Alex Coleman",
        username: "alexcoleman",
        profile_img_url: "https://si0.twimg.com/profile_images/2726845198/d459e06c108e537438bb3a5793be7b07.png"
      }
    ]
  }
  
  app.db.collection('activities').insert(act, function (err, result) {
    res.redirect('/user/crystalchang');
  });
});

app.get('/api/search/destination/:term', function (req, res, next) {
  var context = {
    page: {
      title: "Destination page"
    }
  };

});