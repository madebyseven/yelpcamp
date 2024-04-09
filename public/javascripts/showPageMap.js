// const campground = require("../models/campground");

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", //place to show on HTML tag location using id
  style: "mapbox://styles/mapbox/light-v10", // stylesheet location
  projection: "globe", // Display the map as a globe, since satellite-v9 defaults to Mercator
  //   center: [-74.5, 40], //starting style position [lng, lat]
  center: campground.geometry.coordinates,
  zoom: 8, //starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), "bottom-left");

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${campground.title}</h5><p>${campground.location}</p>`
    )
  )
  .addTo(map);
