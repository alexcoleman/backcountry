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
  // hacky...
  $('.category-item a').click(function (e) {
    e.preventDefault();

    var $this = $(this),
        clickedCategory = ($this.hasClass('active')) ? $this.attr('class').split(' ')[0] : $this.attr('class');
    
    $('.active').removeClass('active');
    $this.addClass('active');

    $('#category-1').hide();
    $('#category-2').hide();
    $('#category-3').hide();
    $('#category-4').hide();

    console.log(clickedCategory)

    $('#' + clickedCategory).show();
  });

  $('.category-1').click();
}