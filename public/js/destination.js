$(document).ready(function () {
  setupSeasonalGearWidget();
  setupSuggestedGear();
});

function setupSeasonalGearWidget() {
  var widget = $('#seasonalGear');

  widget.find('ul li').each(function (e) {
    console.log(e);
  });
}

function setupSuggestedGear() {
  $('.category-item a').click(function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
  });
}