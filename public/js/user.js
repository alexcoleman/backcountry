$(document).ready(function () {
  setupHikeAutoComplete();
  setupFriendAutoComplete();
});

function setupHikeAutoComplete() {
  var hikenames = [
    'Turtlehead Peak',
    'Angel\'s Landing',
    'Bright Angel Trail',
    'Angel Peak',
    'Anniversary Peak',
    'Arizona Hot Springs',
    'Arrow Guzzler',
    'Virgin River Narrows',
    'The Subway',
    'Cathedral Peak',
    'Red Springs Boardwalk Trail',
    'Mt. Charleston Peak (South Loop)',
    'Icebox Canyon',
    'Griffith Peak',
    'Deseret Peak (via Mill Fork Trail)'
    ];

  $('#hike-name').typeahead({
    source: hikenames,
    updater: function (hikeName) {
      $('#add-hike').append('<span>Hiked ' + hikeName + ' with </span>');
    }
  });
}

function setupFriendAutoComplete() {
  var friendnames = [
    'Dylan Bathurst',
    'Charles Watkins',
    'Alex Coleman',
    'Alex Kirmse',
    'Christina Kim',
    'Donny Guy',
    'Dean Curtis'
    ];

  $('#add-friends').typeahead({
    source: friendnames,
    updater: function (item) {
      $('#add-hike').append('<a href="#" style="display:inline-block; padding:20px 10px 0 0;">' + item + '</a>')
    }
  });
}