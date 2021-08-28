// This sample uses the Place Autocomplete widget to allow the user to search
// for and select a place. The sample then displays an info window containing
// the place ID and other information about the place that the user has
// selected.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// Try HTML5 geolocation.



// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
const api_key = "my_api_key";

// Declare an empty object for the place:
const new_place = {};
// Variable for the selected title image of a new place:
var title_image_url = "";

function initMap() {
  //console.log("initMap() called");
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.00, lng: 8.25 },
    zoom: 10,
  });
  const card = document.getElementById("pac-card");
  const input = document.getElementById("pac-input");
  const biasInputElement = document.getElementById("use-location-bias");
  const strictBoundsInputElement = document.getElementById("use-strict-bounds");
  const options = {
    fields: [
      "name",
      "formatted_address",
      "rating",
      "place_id",
      "international_phone_number",
      "website",
      "url",
      "business_status",
      "geometry"
    ],
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
    document.querySelector("#map").style.display = "block";
    document.querySelector('#place_add_success').style.display = "none";
    document.querySelector('#place_exists').style.display = "none";
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    console.log(place);

    /////
    // Get photo references:
    /////

    // Check if the place already exists in the database:
    let exist_route = `place_exists/${place.place_id}`;
    fetch(exist_route)
    .then(response => {
      if (response.status == 202){

        // Call function to fill the form with the selected place:
        fill_form(place);
        fill_place(place);
        document.querySelector('#place_images_for_selection_container').style.display = "block";
        document.querySelector('#place_form').style.display = "block";

        // Call the images:
        const place_photos = [];
        const service = new window.google.maps.places.PlacesService(map);
        service.getDetails(
          {
            placeId: `${place.place_id}`
          },
          (data, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              data.photos &&
                data.photos.forEach(photo => {
                  place_photos.push(photo.getUrl());
                });

                //display the photos:
                document.querySelector('#place_images_for_selection').innerHTML = "";
                for (let i=0; i<place_photos.length; i++) {
                  let place_photo_tile = document.createElement('div');
                  place_photo_tile.className = "card shadow-sm";
                  let tile_image = document.createElement('img');
                  tile_image.src = `${place_photos[i]}`;
                  tile_image.className = "card-img-top";
                  tile_image.alt = "Image " + (i+1);
                  tile_image.onclick = function() {
                    title_image_url = this.src;
                    //console.log(title_image_url);
                    document.querySelector('#selected_image').innerHTML = "Your image selection: " + this.alt;
                  }
                  place_photo_tile.appendChild(tile_image);
                  document.querySelector('#place_images_for_selection').appendChild(place_photo_tile);
                }
              }
            });

      } else {
        document.querySelector('#place_exists').style.display = "block";
      }
    })

    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("Please select a place from the dropdown menue");
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
}

// When place is selected from dropdown, the form will be pre-populated:
function fill_form(place) {
  document.getElementById("id_place_name").value = place.name;
  document.getElementById("id_place_address").value = place.formatted_address;
  document.getElementById("id_place_phone").value = place.international_phone_number;
  document.getElementById("id_place_website").value = place.website;
}
// The "new_place"-object is completed with all the place information
function fill_place(place) {
  new_place.place_name = place.name;
  new_place.place_website = place.website;
  new_place.place_google_id = place.place_id;
  new_place.place_rating = place.rating;
  new_place.place_address = place.formatted_address;
  new_place.place_phone = place.international_phone_number;
  new_place.place_googlemaps = place.url;
  new_place.place_status = place.business_status;
}
