$(document).ready(function () {
  console.log(window.coords)
  mapbox.auto('map', 'usedgearsale.map-y2kozuac');
  mapbox.center({lat: window.coords.lat, lon: window.coords.lon});
});