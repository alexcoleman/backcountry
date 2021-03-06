$(document).ready(function () {
  var map = mapbox.map('map'),
      lat = window.coords.lat,
      lon = window.coords.lon;

  map.addLayer(mapbox.layer().id('usedgearsale.map-y2kozuac'));
  map.ui.zoomer.add();
  map.ui.zoombox.add();

  // Create and add marker layer
  var markerLayer = mapbox.markers.layer().features([{
      "geometry": { "type": "Point", "coordinates": [lon, lat]},
      "properties": { "image": "/img/map-marker.png" }
  }]).factory(function(f) {
  // Define a new factory function. This takes a GeoJSON object
  // as its input and returns an element - in this case an image -
  // that represents the point.
      var img = document.createElement('img');
      img.className = 'marker-image';
      img.setAttribute('src', f.properties.image);
      img.setAttribute('width', 60);
      img.style.margin = "-40px -30px 0px";
      return img;
  });

  map.addLayer(markerLayer)
      .setExtent(markerLayer.extent()).zoom(12, true);
});