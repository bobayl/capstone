function initMap() {
const map = new google.maps.Map(document.getElementById("map"), {
  center: { lat: 47.00, lng: 8.25 },
  zoom: 10,
});

const input = document.getElementById("pac-input");

const biasInputElement = document.getElementById("use-location-bias");
const strictBoundsInputElement = document.getElementById("use-strict-bounds");
const options = {
  fields: ["formatted_address", "geometry", "name"],
  origin: map.getCenter(),
  strictBounds: false,
  types: ["establishment"],
};
map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

const autocomplete = new google.maps.places.Autocomplete(input, options);
// Bind the map's bounds (viewport) property to the autocomplete object,
// so that the autocomplete requests use the current map bounds for the
// bounds option in the request.
autocomplete.bindTo("bounds", map);
const infowindow = new google.maps.InfoWindow();
const infowindowContent = document.getElementById("infowindow-content");
infowindow.setContent(infowindowContent);
const marker = new google.maps.Marker({
  map,
  anchorPoint: new google.maps.Point(0, -29),
});
autocomplete.addListener("place_changed", () => {
  infowindow.close();
  marker.setVisible(false);
  const place = autocomplete.getPlace();
  console.log(place.name);
  console.log(place.rating);

  if (!place.geometry || !place.geometry.location) {
    // User entered the name of a Place that was not suggested and
    // pressed the Enter key, or the Place Details request failed.
    window.alert("No details available for input: '" + place.name + "'");
    return;
  }

  // If the place has a geometry, then present it on a map.
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(17);
  }
  marker.setPosition(place.geometry.location);
  marker.setVisible(true);
  infowindowContent.children["place-name"].textContent = place.name;
  infowindowContent.children["place-address"].textContent =
    place.formatted_address;
  infowindow.open(map, marker);
});

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
}
