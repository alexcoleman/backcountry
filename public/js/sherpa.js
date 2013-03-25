$(document).ready(function () {
  setupFlowNav();
  setupAccountLink();
});

function setupFlowNav() {
  $('#signup button').click(function(e) {
    e.preventDefault();

    $('#signup').hide();
    $('#create-account').show();
  })
}

function setupAccountLink() {
  $('.account-link').click(function (e) {
    e.preventDefault();

    $('#create-account').hide();
    $('#account-dashboard').show();
  })
}