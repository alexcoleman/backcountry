$(document).ready(function () {
  setupSeasonalGearWidget();
});

function setupSeasonalGearWidget() {
  var widget = $('#seasonalGear');

  widget.find('ul li').each(function (e) {
    console.log(e);
  });
}