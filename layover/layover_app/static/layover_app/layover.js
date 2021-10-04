// Define global variables:
var infowindows;
var markers;

// When back arrow is clicked, show previous section

window.onpopstate = function(event) {
    //console.log(event.state.page);
    //showSection(event.state.section);
    //console.log(event);
    if (event.state) {
      show_page(event.state.page);
    }
}


// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#destinations').style.display = "none";
  if (document.querySelector('#places')) {
    document.querySelector('#places').style.display = "none";
  }
  if (document.querySelector('#place_details')) {
    document.querySelector('#place_details').style.display = "none";
  }
  if (document.querySelector('#add_new')) {
    document.querySelector('#add_new').style.display = "none";
  }
  if (document.querySelector('#my_places')) {
    document.querySelector('#my_places').style.display = "none";
  }

  // Start with showing all destinations:
  show_destinations();

  // Toggle with Nav-Bar-Links:
  if (document.querySelector('#add_new')) {
    document.querySelector('#add_new_menue').addEventListener('click', () => {
      // Add the current state to the history
      history.pushState({page: "addPlace"}, "", "addPlace");
      add_place();
    });
  }
  document.querySelector('#show_start_page').addEventListener('click', () => {
    // Add the current state to the history
    history.pushState({page: "start"}, "", "start");
    show_start_page();
  });
  document.querySelector('#destinations_view').addEventListener('click', () => {
    // Add the current state to the history
    history.pushState({page: "destinations"}, "", "destinations");
    show_destinations();
  });
  if (document.querySelector('#my_places')) {
    document.querySelector('#show_my_places').addEventListener('click', () => {
      // Add the current state to the history
      history.pushState({page: "myPlaces"}, "", "myPlaces");
      my_places();
    });
  }
  if (document.querySelector('#news_page')) {
    document.querySelector('#news_page').addEventListener('click', () => {
      // Add the current state to the history
      history.pushState({page: "newest"}, "", "newest");
      show_newest();
    });
  }
});

//************************************
// Show a page with the newest added places:
//************************************
function show_newest() {
  console.log("in here");
  //document.querySelector('#newest').style.display = "block";
}

//************************************
// Function to call pages according history:
//************************************
function show_page(page) {
  //console.log("going to page " + page);
  if (page === "addPlace") {
    add_place();
  } else if (page === "start") {
    show_start_page();
  } else if (page === "myPlaces") {
    my_places();
  } else {
    show_destinations();
  }
}

//************************************
// Show the start page (intro page):
//************************************
function show_start_page() {

  if (document.querySelector('#my_places')) {
    document.querySelector('#my_places').style.display = "none";
  }
  document.querySelector('#start_page').style.display = "block";
  document.querySelector('#destinations').style.display = "none";
  if (document.querySelector('#places')) {
    document.querySelector('#places').style.display = "none";
  }
  if (document.querySelector('#place_details')) {
    document.querySelector('#place_details').style.display = "none";
  }
  if (document.querySelector('#add_new')) {
    document.querySelector('#add_new').style.display = "none";
  }
}

//************************************
// Show the destinations overview:
//************************************
function show_destinations() {
  // Display the destinations div:
  document.querySelector('#destinations').style.display = "block";
  document.querySelector('#start_page').style.display = "none";
  if (document.querySelector('#places')) {
    document.querySelector('#places').style.display = "none";
  }
  if (document.querySelector('#place_details')) {
    document.querySelector('#place_details').style.display = "none";
  }
  if (document.querySelector('#add_new')) {
    document.querySelector('#add_new').style.display = "none";
  }
  if (document.querySelector('#my_places')) {
    document.querySelector('#my_places').style.display = "none";
  }

  // Fetch all the stored destinations from the server:
  fetch('show_destinations', {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    // Clear the select options:
    document.querySelector('#destination_selector').innerHTML="";

    // Create the options:
    let first_option = document.createElement('option');
    first_option.value = "none";
    first_option.innerHTML = "Select Destination";
    document.querySelector('#destination_selector').append(first_option);

    // Loop over all destinations:
    destinations = data.destinations;
    for (destination of destinations){
      let option = document.createElement('option');
      option.value = destination.id;
      option.innerHTML = destination.destination_name + " - " + destination.destination_iata;
      document.querySelector('#destination_selector').append(option);
    }
    // Last option: create new destination:
    let last_option = document.createElement('option');
    last_option.innerHTML = "Create New Destination";
    last_option.value = "new";
    document.querySelector('#destination_selector').append(last_option);

    // Event listener for when an option is selected:
    document.querySelector('#destination_selector').onchange = function() {
      let selected_destination_id = document.querySelector('#destination_selector').value;
      // Option for the user to open (store) a new destination
      if (selected_destination_id === "new"){
        // Call this function opens the dialog and will save the new destination:
        save_new_destination();
        document.querySelector('#destination_selector').options[0].selected = "selected";
      } else {
        //show_destination()
        show_destination(selected_destination_id);
      }
    }
    // Reset the selector in the background:
    document.querySelector('#destination_selector').options[0].selected = "selected";

    // Clear destinations grid:
    document.querySelector('#destinations_container').innerHTML = "";
    // Loop over the destinations:
    for (destination of destinations){
      let destination_tile = document.createElement('div');
      destination_tile.className = "shadow-sm p-3 mb-5 bg-body rounded";
      let destination_image = document.createElement('img');
      destination_image.src = `${destination.destination_img}`
      //destination_tile.style.backgroundImage = `url(${destination.destination_img})`;
      let destination_title = document.createElement('h3');
      let destination_id = destination.id;
      destination_title.innerHTML = destination.destination_name;
      destination_title.className = "centered";
      destination_tile.onmouseover = function(){
        this.style = "opacity: 60%; cursor: pointer";
      };
      destination_tile.onmouseout = function() {
        this.style = "opacity: 100%";
      };
      destination_tile.onclick = function() {
        show_destination(destination_id);
      };
      destination_title.onmouseover = function() {
        this.style = "cursor: pointer";
      };
      destination_tile.appendChild(destination_image);
      destination_tile.appendChild(destination_title);
      document.querySelector('#destinations_container').appendChild(destination_tile);
    }
  });
}

//************************************
// Save a new destination:
//************************************
function save_new_destination(){
  // Pop up the modal to enter the new destination:
  const destination_modal = new bootstrap.Modal(document.getElementById('new_destination_modal'), backdrop=true);
  destination_modal.show();
  // Hide the images section of the modal:
  document.querySelector('#destination_images_modal_container').style.display = "none";
  document.querySelector('#image_error').style.display = "none";
  document.querySelector('#spinner').style.display = "none";
  document.querySelector('#destination_conflict').style.display = "none";
  // Clear the form:
  document.querySelector('#add_destination_form').reset();
  document.querySelector('#save_destination').innerHTML = "Next";
  document.querySelector('#save_destination').disabled = false;
  // Force the IATA code to be all capitals:
  document.querySelector('#new_destination_iata').onkeyup = function(){
    this.value = this.value.toUpperCase();
  }
  // Create the destination object:
  const new_destination = {};

  // Add click event listener to the submit button:
  document.querySelector('#save_destination').onclick = function() {
    // Show the images container
    document.querySelector('#destination_conflict').style.display = "none";

    document.querySelector('#destination_images_modal_container').style.display = "block";
    document.querySelector('#destination_images_modal').style.display = "block";
    document.querySelector('#destination_images_modal').innerHTML = "";
    // Read the entered values:
    // Fill the object:
    new_destination.destination_name = document.querySelector('#new_destination_name').value;
    new_destination.destination_iata = document.querySelector('#new_destination_iata').value;

    // Check if the input is valid:
    ///// TODO: conditions for valid input./////

    // When all checks pass:
    // Send it to the server:
    let route = 'add_destination';
    fetch(route, {
      method: 'POST',
      body: JSON.stringify({
        destination: new_destination
      })
    })
    .then(response => {
      // Check if the destination already exists in the database:
      if (response.status == 409) {
        document.querySelector('#destination_conflict').style.display = "block";
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      if (data["status"] === 201) {

        // If the place is successfully created with name and iata code, go to the destination image picker:
        //display the photos:
        let image_links = data.image_links;
        let dest_id = data.destination_id;
        console.log(dest_id);
        document.querySelector('#save_destination').innerHTML = "Save Destination";
        document.querySelector('#destination_images_modal').innerHTML = "";


        // Loop over the image links:
        document.querySelector('#destination_images_modal').style.display = "block";

        for (let i=0; i<image_links.length; i++) {
          let dest_photo_tile = document.createElement('div');
          dest_photo_tile.className = "card shadow-sm";
          let tile_image = document.createElement('img');
          tile_image.src = `${image_links[i]}`;
          tile_image.className = "card-img-top";
          tile_image.alt = "Image " + (i+1);
          tile_image.id = "image" + i;
          tile_image.onclick = function() {
            title_image_url = this.src;
            for (let j=0; j<image_links.length; j++){
              document.querySelector(`#image${j}`).style = "border: none";
            }
            this.style = "border: solid";
            document.querySelector('#save_destination').onclick = function() {
              // On submitting: Disable submit button, grey out content, show spinner:
              ///// TODO
              this.disabled = true;


              save_destination_image(title_image_url, dest_id, destination_modal);
            }
          }
          dest_photo_tile.appendChild(tile_image);
          document.querySelector('#destination_images_modal').appendChild(dest_photo_tile);
        }
      }
    });
  }
}
function save_destination_image(img_url, dest_id, dest_modal) {
  console.log("saving destination image...");
  console.log(img_url);
  document.querySelector('#spinner').style.display = "block";

  const destination_img = {};
  destination_img.url = img_url;

  // onclick send the selected image url to the server:
  document.querySelector('#spinner').style.display = "block";
  let route = `save_destination_image/${dest_id}`;
  fetch(route, {
    method: 'POST',
    body: JSON.stringify({
      destination_img: destination_img
    })
  })
  .then(response => {
    if (response.status != 201) {
      document.querySelector('#spinner').style.display = "none";
      document.querySelector('#image_error').style.display = "block";
      document.querySelector('#save_destination').disabled = false;
    }
    return response.json();
  })
  .then(data => {
    document.querySelector('#spinner').style.display = "block";
    console.log(data);
    // If the destination is added from the destinations page:
    if (document.querySelector('#destinations').style.display == "block"){
      show_destinations();
      dest_modal.hide();
    // If the destination is added from the add place page:
    } else {
      update_destination_selector();
      dest_modal.hide();
    }
  });
}

//************************************************************************
// Function to update the destinations in the destination selector:
//************************************************************************
function update_destination_selector(){
  // Asynchronously adjust the destination selector:
  fetch('show_destinations')
  .then(response => response.json())
  .then(data => {
    // Clear the selector:
    document.querySelector('#id_place_destination').innerHTML = "";
    // Create the first (empty) option:
    let option = document.createElement('option');
    option.value = "";
    option.innerHTML = "---------";
    document.querySelector('#id_place_destination').append(option);

    let destinations = data.destinations;
    for (destination of destinations){
      let option = document.createElement('option');
      option.value = destination.id;
      option.innerHTML = destination.destination_name + " - " + destination.destination_iata;
      document.querySelector('#id_place_destination').append(option);
    }
    // Last option: create new destination:
    let last_option = document.createElement('option');
    last_option.innerHTML = "Create New Destination";
    last_option.value = "new";
    document.querySelector('#id_place_destination').append(last_option);
  });
}

//************************************
// Show the places of a destination:
//************************************
function show_destination(destination_id) {
  // Add the current state to the history
  history.pushState({page: "destination"}, "", destination_id);
  document.querySelector('#destinations').style.display = "none";
  if (document.querySelector('#place_details')) {
    document.querySelector('#place_details').style.display = "none";
  }

  if (document.querySelector('#places')) {
    document.querySelector('#places').style.display = "block";
    document.querySelector('#create_place_for_destination').onclick = function() {
      add_place();
    }
  }

  // Hide the places-map:
  document.querySelector('#places_map').style.display = "none";

  // fetch all the places for the selected destination:
  let route = `show_destination/${destination_id}`;
  fetch(route, {
    method: 'GET'
  })
  .then(response => {
    if (response.status === 401) {
      window.location.replace("login_view");
    }
    return response.json();
  })
  .then(data => {
    if (data["error"]) {
      ///// TODO /////
    } else {
      let destination = data["destination"];
      let places = data["places"];
      let categories = data["categories"];
      let editable = data["editable"];

      for (let i=0; i<places.length; i++) {
        places[i].is_editable = editable[i];
      }

      // Fill destination title:
      document.querySelector("#destination_title").innerHTML = destination["destination_name"];

      // List all places:
      list_places(places, categories, destination_id);
    }
  });
}
function list_places(places, categories, destination_id) {
  // Add the map option to the respective button:
  document.querySelector('#places_on_map_button').onclick = function() {
    show_places_on_map(places);
  }
  /////
  // Category selector:
  // Clear it:
  document.querySelector('#category_selector').innerHTML = "";
  // Create first option:
  let first_option = document.createElement('option');
  first_option.value = "none";
  first_option.innerHTML = "Select Category";
  document.querySelector('#category_selector').append(first_option);
  // Loop over the categories:
  for (category of categories) {
    let option = document.createElement('option');
    option.value = "category" + category.id;
    option.innerHTML = category.category_name;
    document.querySelector('#category_selector').append(option);
  }
  document.querySelector('#category_selector').options[0].selected = "selected";
  // On change jump to the selected option:
  document.querySelector('#category_selector').onchange = function() {
    let selected_category_value = document.querySelector('#category_selector').value;
    let anchor = "#" + selected_category_value;
    // If the current view is the list view, scroll to the respective places
    // If the current view is the map view, filter the places
    if (document.querySelector('#places_map').style.display === "none") {
      console.log(selected_category_value);
      console.log(anchor);
      document.querySelector(anchor).scrollIntoView();
    } else {
      // Filter the places for the selected category:
      filter_places(places, selected_category_value);
    }
  }

  // Clear the places container:
  document.querySelector('#places_container').innerHTML = "";

  // Loop over the categories:
  for (category of categories) {
    // Create a category container:
    let category_container = document.createElement('div');
    // Create category title:
    let category_title_container = document.createElement('div');
    category_title_container.id = "category_title_container";
    let category_title = document.createElement('h2');
    category_title.className = "fw-light";
    category_title.id = "category" + category.id;
    category_title.innerHTML = category.category_name;
    category_title_container.appendChild(category_title);
    category_container.appendChild(category_title_container);
    // Create the card group for the category:
    let card_group = document.createElement('div');
    card_group.id = "card-group";

    // Loop over the places:
    for (place of places) {
      if (place.place_category === category.category_name) {
        // Create the card for each place:
        let place_card = document.createElement('div');
        place_card.className = "card shadow-sm";
        place_image = document.createElement('img');
        place_image.src = `${place.place_image_url}`;
        place_image.className = "card-img-top";
        place_image.alt = "...";
        place_card.appendChild(place_image);
        let place_body = document.createElement('div');
        place_body.className = "card-body";
        let place_title = document.createElement('h5');
        place_title.className = "card-title";
        place_title.innerHTML = place.place_name;
        place_body.appendChild(place_title);
        let place_subtitle = document.createElement('h6');
        place_subtitle.innerHTML = place.place_subcategory;
        place_body.appendChild(place_subtitle);
        place_card.appendChild(place_body);
        let place_footer = document.createElement('div');
        place_footer.className = "card-footer";
        let footer_text = document.createElement('small');
        footer_text.className = "text-muted";
        footer_text.innerHTML = "added on " + place.place_date_added + " by " + place.place_author;
        place_footer.appendChild(footer_text);
        place_card.appendChild(place_footer);
        // Add click event to the place_card:
        place_card.onmouseover = function(){
          this.style = "opacity: 50%";
        }
        place_card.onmouseout = function(){
          this.style = "opacity: 100%";
        }
        place_card.id = place.id;
        place_card.name = place.place_name;

        place_card.addEventListener('click', load_place.bind(this, place.id, place.place_destination_id), false);

        card_group.appendChild(place_card);
      }
    }
    category_container.appendChild(card_group);
    document.querySelector('#places_container').appendChild(category_container);
  }
}

//************************************
// Load place function:
//************************************
function load_place(place_id, destination_id) {
  // Display the place details block:
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#destinations').style.display = "none";

  if (document.querySelector('#add_new')) {
    document.querySelector('#add_new').style.display = "none";
  }
  if (document.querySelector('#my_places')) {
    document.querySelector('#my_places').style.display = "none";
  }
  document.querySelector('#places').style.display = "none";
  if (document.querySelector('#place_details')) {
    document.querySelector('#place_details').style.display = "block";
  }


  // Fetch the place details:
  let route = `load_place/${place_id}`;
  console.log(route);
  fetch(route)
  .then(response => response.json())
  .then(data => {
    let place = data.place;
    console.log(place);
    let is_editable = data.is_editable;

    // Update the back button:
    let back_to_destination_button = document.querySelector('#back_to_destination_button');
    back_to_destination_button.innerHTML = `Back to destination ${place.place_destination}`;
    back_to_destination_button.onclick = function() {
      console.log(`back to destination ${destination_id}`);
      show_destination(destination_id);
    }
    // Update the title:
    document.querySelector('#place_title').innerHTML = place.place_name;
    // Update the place author:
    document.querySelector('#place_author').innerHTML = `Place selected by ${place.place_author}`;
    // Setting the background image:
    document.querySelector('#place_header').style.backgroundImage = `url(${place.place_image_url})`;
    document.querySelector('#place_header').style.backgroundSize = "cover";

    // If author is the visitor, activate the edit button:
    let edit_button = document.querySelector('#edit_place_button');
    if (!is_editable) {
      edit_button.style.display = "none";
    } else {
      edit_button.onclick = function() {
        edit_place(place);
      }
    }
    // If author the visitor, hide the comment button:
    let comment_button = document.querySelector('#comment_place_button');
    if (!is_editable) {
      // If it is not editable, it is commentable and vice versa
      comment_button.onclick = function() {
        comment_place(place);
      }
    } else {
      comment_button.disabled = true;
      comment_button.style.display = "none";
    }


    // Update place info:
    if (place.place_infos.length > 5) {
      document.querySelector('#place_info').innerHTML = place.place_infos;
    } else {
      document.querySelector('#place_info').innerHTML = "No place description by the author yet.";
    }

    document.querySelector('#place_name').innerHTML = place.place_name;
    document.querySelector('#place_address').innerHTML = "  " + place.place_address;
    document.querySelector('#place_website').innerHTML = "  " + place.place_website;
    document.querySelector('#place_website').href = place.place_website;
    document.querySelector('#place_phone').innerHTML = "  " + place.place_phone;
    document.querySelector('#place_category').innerHTML = "Category:  " + place.place_category;
    document.querySelector('#place_subcategory').innerHTML = "Subcategory:  " + place.place_subcategory;
    document.querySelector('#place_googlemaps').href = place.place_googlemaps;
    document.querySelector('#place_author2').innerHTML = "Listed by:  " + place.place_author;

    // Create the image section:
    // First, clear it:
    document.querySelector('#place_details_images').innerHTML = "";
    // Load the images of the place:
    // Call the images:
    const place_photos = [];
    const service = new window.google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: `${place.place_id}`
      },
      (data, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          data.photos && data.photos.forEach(photo => {
            place_photos.push(photo.getUrl());
          });

          //display the photos:
          // Loop over the images: "i" is the index used for displaying the gallery
          var i = 0;
          for (photo of place_photos){
            let place_photo_tile = document.createElement('div');
            place_photo_tile.className = "shadow-sm p-3 mb-5 bg-body rounded";
            let place_photo = document.createElement('img');
            place_photo.src = `${photo}`;
            place_photo_tile.append(place_photo);
            // Click to enlarge:
            place_photo_tile.addEventListener('click', open_gallery.bind(this, i, place_photos), false);
            document.querySelector('#place_details_images').append(place_photo_tile);
            i++;
          }
        }
      });

    // Load the comments:
    load_comments(place_id);
  })
  // Add the current state to the history
  //history.pushState({page: "place"}, "", place_id);
}
function load_comments(place_id) {
  let route = `comment_place/${place_id}`;
  fetch(route, {
    method: "GET"
  })
  .then(response => response.json())
  .then(data => {

    // Clear the comments section before loading comments:
    let comment_container = document.querySelector('#comments');
    comment_container.innerHTML = "";

    // Extract the comments from the response:
    let comments = data.comments;

    // Loop over all comments and create the comment cards:
    if (comments.length == 0) {
      let empty_comments = document.createElement('div');
      empty_comments.id = "empty_comments";
      let empty_comments_text = document.createElement('h5');
      empty_comments_text.className = "fw-light";
      empty_comments_text.innerHTML = "*** No comments yet ***";
      empty_comments.appendChild(empty_comments_text);
      comment_container.appendChild(empty_comments);
    } else {
      for (comment of comments) {
        console.log(comment.author);
        let comment_card = document.createElement('div');
        comment_card.className = "card text-dark bg-light mb-3";
        comment_card.id = "comment";
        let comment_header = document.createElement('div');
        comment_header.className = "card-header";
        comment_header.style = "width: 100%";
        comment_header.innerHTML = `Comment by ${comment.author} on ${comment.timestamp}.`;
        comment_card.appendChild(comment_header);
        let comment_body = document.createElement('div');
        comment_body.className = "card-body text-dark";
        let comment_text = document.createElement('p');
        comment_text.className = "card-text";
        comment_text.innerHTML = comment.text;
        comment_body.appendChild(comment_text);
        comment_card.appendChild(comment_body);
        comment_container.appendChild(comment_card);
      }
    }
  })
}
function open_gallery(i, place_photos) {
  // Clear the modal:
  document.querySelector('#gallery_inner').innerHTML = "";
  // variable "index" to mark the active slide.
  let index = 0;
  for (photo of place_photos) {
    // Adding the images
    let slide = document.createElement('div');
    if (index == i) {
      slide.className = "carousel-item active";
    } else {
      slide.className = "carousel-item";
    }
    let slide_img = document.createElement('img');
    slide_img.className = "d-block w-100";
    slide_img.src = `${photo}`;
    //console.log(slide_img);
    slide_img.alt = "...";
    // Append image to the slide:
    slide.appendChild(slide_img);
    document.querySelector('#gallery_inner').appendChild(slide);
    index++;
  }
  const gallery_modal = new bootstrap.Modal(document.getElementById('gallery_modal'), backdrop=true);
  gallery_modal.show();
}
//************************************
// Shows the add_place view to let the user to search Google Maps places:
//************************************
function add_place() {
  document.querySelector('#add_new').style.display = "block";
  document.querySelector('#place_images_for_selection_container').style.display = "none";
  if (document.querySelector('#search_frame').style.display === "none") {
    document.querySelector('#search_frame').style.display = "block";
  }
  document.querySelector('#map').style.display = "block";
  document.querySelector('#pac-input').value = "";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#place_form').style.display = "none";
  document.querySelector('#place_add_success').style.display = "none";
  document.querySelector('#place_exists').style.display = "none";
  document.querySelector('#place_image_error').style.display = "none";
  document.querySelector('#my_places').style.display = "none";

  /////
  // Switch between Google Maps supported and manual place recording:
  document.querySelector('#add_place_manually').onclick = function() {
    // Hide map and map search bar:
    document.querySelector('#map').style.display = "none";
    document.querySelector('#search_frame').style.display = "none";
    // Hide other elements such as image container
    document.querySelector('#place_images_for_selection_container').style.display = "none";
    document.querySelector('#place_add_success').style.display = "none";
    document.querySelector('#place_exists').style.display = "none";
    document.querySelector('#place_form').style.display = "block";
    // Change button text and function to switch back to google maps search view:
    document.querySelector('#add_place_manually').innerHTML = "Search on Google Maps";
    document.querySelector('#add_place_manually').onclick = function() {
      document.querySelector('#add_place_manually').innerHTML = "Add a Place Manually";
      document.querySelector('#place_add_button2').disabled = true;
      add_place();
    }

    // Enable all fields:
    document.querySelector('#place_add_button2').disabled = false;
    document.getElementById("id_place_name").disabled = false;
    document.getElementById("id_place_address").disabled = false;
    document.getElementById("id_place_phone").disabled = false;
    document.getElementById("id_place_website").disabled = false;

    // Clear all fields:
    document.getElementById('new_place_form').reset();
  }
  /////

  // Add event listener for the user selecting a place from the dropdown:
  let place_add_button1 = document.querySelector('#place_add_button1');
  let place_add_button2 = document.querySelector('#place_add_button2');
  let place_form = document.querySelector('#place_form');

  // When the place is selected from the google dropdown, the form to
  // complete the place is shown:
  document.querySelector('#pac-input').addEventListener('change', () => {
    place_add_button1.disabled = false;
    place_add_button2.disabled = false;
    place_add_button1.innerHTML = "Add Place!";
    place_add_button2.innerHTML = "Add Place!";
    document.getElementById("id_place_category").options[0].selected = "selected";
    document.getElementById("id_place_destination").options[0].selected = "selected";
  });

  // Update the destination selector:
  update_destination_selector();

  // Event listener for when "create a new destination" is selected:
  document.querySelector('#id_place_destination').onchange = function() {
    let selected_destination_id = document.querySelector('#id_place_destination').value;
    // Option for the user to open (store) a new destination (could also be a non-Edelweiss destination):
    if (selected_destination_id === "new"){
      // Call the save_new_destination() function:
      save_new_destination();
      // Reset the selector in the background:
      document.querySelector('#id_place_destination').options[0].selected = "selected";
    }
  }

  // Initialize the subcategory field:
  document.getElementById("id_place_subcategory").innerHTML="";
  // Set the initial option:
  let option = document.createElement('option');
  option.value = "";
  option.innerHTML = "---------";
  document.getElementById("id_place_subcategory").append(option);

  // Set the subcategory depending on the selected category:
  document.getElementById("id_place_category").addEventListener('change', () => {
    update_subcategory();
  });

  // Add the submit function to the submit buttons:
  [place_add_button1, place_add_button2].forEach(item => {
    item.addEventListener('click', () => {
      let place_name = document.getElementById("id_place_name");
      let destination = document.getElementById("id_place_destination");
      let category = document.getElementById("id_place_category");
      let subcategory = document.getElementById("id_place_subcategory");
      // Check if destination and category have values:
      if (!place_name.value) {
        place_name.style = "border-color: red; color: red";
        place_name.addEventListener('change', () => {
          place_name.style = "border-color: lightgrey; color: black";
        });
      } else {
        place_name.style = "border-color: lightgrey; color: black";
      }
      if (!destination.value) {
        destination.style = "border-color: red; color: red";
        destination.addEventListener('change', () => {
          destination.style = "border-color: lightgrey; color: black";
        });
      } else {
        destination.style = "border-color: lightgrey; color: black";
      }
      if (!category.value) {
        category.style = "border-color: red; color: red";
        category.addEventListener('change', () => {
          category.style = "border-color: lightgrey; color: black";
        });
      } else {
        category.style = "border-color: lightgrey; color: black";
      }
      if (!subcategory.value) {
        subcategory.style = "border-color: red; color: red";
        subcategory.addEventListener('change', () => {
          subcategory.style = "border-color: lightgrey; color: black";
        });
      } else {
        subcategory.style = "border-color: lightgrey; color: black";
      }
      // If both destination and categories are selected, then submit the place:
      if (place_name.value && category.value && destination.value && subcategory.value) {
        submit_place(new_place);
      }
    });
  });
}

//************************************
// Function to update the subcategory:
//************************************
function update_subcategory() {
  let selected_category = document.getElementById("id_place_category").value;
  let selected_subcategory = document.getElementById("id_place_subcategory");
  // Check if a category is selected:
  if (selected_category > 0) {
    let route = `load_subcategories/${selected_category}`;
    fetch(route)
    .then(response => response.json())
    .then(data => {
      selected_subcategory.innerHTML="";
      // Set the initial option:
      let option = document.createElement('option');
      option.value = "";
      option.innerHTML = "---------";
      selected_subcategory.append(option);
      let subcategories = data["subcategories"];
      // Loop over the subcategories:
      for (sub of subcategories) {
        let option = document.createElement('option');
        option.value = sub.id;
        option.innerHTML = sub.subcategory_name;
        selected_subcategory.append(option);
      }
      // If the desired subcategory is not listed, a new one can be created:
      option = document.createElement('option');
      option.value = "new";
      option.innerHTML = "Add new subcategory";
      selected_subcategory.append(option);
      // Option to add subcategory if there isn't any suitable:
      selected_subcategory.onchange = function() {
        if (selected_subcategory.value === "new"){
          add_subcategory();
        }
      }
    });
  } else {
    // Clear the subcategory options and just add the "select" option:
    document.getElementById("id_place_subcategory").innerHTML="";
    let option = document.createElement('option');
    option.value = "";
    option.innerHTML = "---------";
    document.getElementById("id_place_subcategory").append(option);
  }
}

//************************************
// Function to add a new subcategory:
//************************************
function add_subcategory() {
  // Creating and show the modal:
  var sub_cat_modal = new bootstrap.Modal(document.getElementById('subcategory_modal'));
  sub_cat_modal.show();

  // Clear the form:
  document.querySelector('#new_subcategory').value = "";
  // Prefill the category into the form:
  let sel = document.getElementById("id_place_category");
  document.querySelector('#modal_category').value = sel.options[sel.selectedIndex].text;

  document.querySelector('#save_subcategory').onclick = function() {
    let new_subcategory = document.querySelector('#new_subcategory').value;
    let category = sel.options[sel.selectedIndex].value;

    fetch('add_subcategory', {
      method: 'POST',
      body: JSON.stringify({
        category: category,
        new_subcategory: new_subcategory
      })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      sub_cat_modal.hide();
      update_subcategory();
    })
  }
}

//************************************
// Function that sends the place to the server for storing in the database
//************************************
function submit_place(place) {
  place.place_name = document.getElementById("id_place_name").value;
  place.place_destination = document.getElementById("id_place_destination").value;
  place.place_category = document.getElementById("id_place_category").value;
  place.place_subcategory = document.getElementById("id_place_subcategory").value;
  place.place_infos = document.getElementById("id_place_infos").value;
  // This may be empty:
  place.place_image_url = title_image_url;
  // For image upload from the own device:
  let input = document.querySelector('input[type="file"]')
  let place_image = input.files[0];
  let place_data = JSON.stringify({place: place});

  console.log(place);
  console.log(input.files[0]);
  console.log(JSON.stringify({place: place}))

  // Check if destination and category are selected:
  let destination_field = document.getElementById("id_place_destination");
  let category_field = document.getElementById("id_place_category");
  if (!place.place_destination || !place.place_category) {
    alert("please select destination and category");
  } else {
    
    fetch('add_place', {
      method: 'POST',
      body: JSON.stringify({
        place: place
      })
    })
    .then(response => {
      if (response.status == 201){
        document.querySelector('#place_add_success').style.display = "block";
        document.querySelector('#place_exists').style.display = "none";
      } else if (response.status == 409){
        document.querySelector('#place_add_success').style.display = "none";
        document.querySelector('#place_exists').style.display = "block";
      } else {
        document.querySelector('#place_image_error').style.display = "block";
      }
      return response.json();
    })
    .then(data => {
      // Empty the form:
      document.querySelector("#new_place_form").reset();
      document.querySelector("#pac-input").value = "";
      //document.querySelector("#search_frame").style.display = "none";
      document.querySelector("#place_form").style.display = "none";
      document.querySelector("#map").style.display = "none";
      document.querySelector('#place_images_for_selection_container').style.display = "none";
    });
  }
}

//************************************
// Function to list my places sorted by destination:
//************************************
function my_places() {
  // Clear the content:
  document.querySelector('#my_places_list').innerHTML = "";
  // Display the destinations div:
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "none";
  document.querySelector('#my_places').style.display = "block";

  // Fetch the users places from the server:
  fetch('my_places')
  .then(response => response.json())
  .then(data => {
    let my_destinations = data.my_destinations;
    //console.log(data);
    let my_places = data.my_places;
    console.log(my_places);
    // Loop over the categories:
    for (destination of my_destinations) {
      // Create a category container:
      let dest_container = document.createElement('div');
      // Create category title:
      let dest_title = document.createElement('h2');
      dest_title.className = "fw-light";
      dest_title.innerHTML = destination;
      dest_container.appendChild(dest_title);
      // Create the card group for the category:
      let card_group = document.createElement('div');
      card_group.className = "card-group";

      // Loop over the places:
      for (place of my_places) {
        if (place.place_destination === destination) {

          // Store the destination id:
          let place_destination_id = place.place_destination_id;

          // Create the card for each place:
          let place_card = document.createElement('div');
          place_card.className = "card shadow-sm";
          place_image = document.createElement('img');
          place_image.src = `${place.place_image_url}`;
          place_image.className = "card-img-top";
          place_image.alt = "...";
          place_card.appendChild(place_image);
          let place_body = document.createElement('div');
          place_body.className = "card-body";
          let place_title = document.createElement('h5');
          place_title.className = "card-title";
          place_title.innerHTML = place.place_name;
          place_body.appendChild(place_title);
          let place_subtitle = document.createElement('h6');
          place_subtitle.innerHTML = place.place_subcategory;
          place_body.appendChild(place_subtitle);
          place_card.appendChild(place_body);
          let place_footer = document.createElement('div');
          place_footer.className = "card-footer";
          let footer_text = document.createElement('small');
          footer_text.className = "text-muted";
          footer_text.innerHTML = "added on " + place.place_date_added + " by " + place.place_author;
          place_footer.appendChild(footer_text);
          place_card.appendChild(place_footer);
          // Add click event to the place_card:
          place_card.onmouseover = function(){
            this.style = "opacity: 50%";
          }
          place_card.onmouseout = function(){
            this.style = "opacity: 100%";
          }
          place_card.id = place.id;
          place_card.name = place.place_name;

          console.log(place.place_destination_id);
          place_card.onclick = function() {
            // Load the place:
            console.log(place_destination_id);
            load_place(place_card.id, place_destination_id);
          }
          card_group.appendChild(place_card);
        }
      }
      dest_container.appendChild(card_group);
      document.querySelector('#my_places_list').appendChild(dest_container);
    }
  })
}

//************************************
// Edit Place (and delete Place) :
//************************************
function edit_place(place) {
  console.log(place);
  // Pop up the modal to edit the place:
  const edit_modal = new bootstrap.Modal(document.getElementById('edit_place_modal'), backdrop=true);
  // Set the modal title:
  document.querySelector('#edit_place_modal_title').innerHTML = place.place_name + " - " + place.place_destination;
  // Prepopulate the form with the existing values:
  update_destinations_and_categories(place);
  document.querySelector("#edit_placeinfos").value = place.place_infos;

  // Show the modal:
  edit_modal.show();

  // Configure the delete button:
  document.querySelector('#delete_place_button').onclick = function() {
    // Pop up a confimation modal:
    document.querySelector('#delete_modal_title').innerHTML = `Delete Place ${place.place_name}`;
    document.querySelector('#delete_modal_text').innerHTML = `Are you sure you want to delete the place "${place.place_name}"?`;
    const delete_modal = new bootstrap.Modal(document.getElementById('delete_place_modal'), backdrop=true);
    edit_modal.hide();
    delete_modal.show();

    document.querySelector('#confirm_delete_button').onclick = function() {
      delete_place(place);
      delete_modal.hide();
      show_destination(place.place_destination_id);
    }
  }

  // Send the edits to the server:
  document.querySelector('#save_edit_button').onclick = function() {
    send_edit(place.id);
    edit_modal.hide();
  }
}
function delete_place(place) {
  console.log("deleting place...");
  let route = `delete_place/${place.id}`;
  fetch(route, {
    method: 'DELETE'
  })
  .then(response => response.json)
  .then(data => {
    console.log(data);
    show_destination(place.place_destination_id);
  })
}
function update_destinations_and_categories(place) {
  fetch('update_destinations_and_categories')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Extract the data:
    let destinations = data.destinations;
    let categories = data.categories;

    // Update destination selector:
    let dest_selector = document.querySelector('#edit_destination');
    dest_selector.innerHTML = "";
    for (destination of destinations) {
      let option = document.createElement('option');
      option.value = destination.destination_iata;
      option.innerHTML = destination.destination_name + " - " + destination.destination_iata;
      if (place.place_destination == destination.destination_name) {
        option.selected = "selected";
      }
      dest_selector.appendChild(option);
    }
    dest_selector.options.selected = "selected";

    // Update category selector:
    let cat_selector = document.querySelector('#edit_category');
    let sub_cat_selector = document.querySelector('#edit_subcategory');
    cat_selector.innerHTML = "";
    sub_cat_selector.innerHTML = "";
    for (category of categories) {
      let option = document.createElement('option');
      option.value = category.category_name;
      option.innerHTML = category.category_name;
      if (place.place_category == category.category_name) {
        option.selected = "selected";
        // Set the subcategory menu:
        for (subcategory of category.subcategories) {
          let option = document.createElement('option');
          option.value = subcategory;
          option.innerHTML = subcategory;
          if (place.place_subcategory == subcategory) {
            option.selected = "selected";
          }
          sub_cat_selector.appendChild(option);
        }
        sub_cat_selector.options.selected = "selected";
      }
      cat_selector.appendChild(option);
    }
    cat_selector.options.selected = "selected";

    cat_selector.onchange = function() {
      let selected_category = cat_selector.value;
      sub_cat_selector.innerHTML = "";
      for (category of categories) {
        if (selected_category == category.category_name) {
          // Set the subcategory menu:
          for (subcategory of category.subcategories) {
            let option = document.createElement('option');
            option.value = subcategory;
            option.innerHTML = subcategory;
            if (place.place_subcategory == subcategory) {
              option.selected = "selected";
            }
            sub_cat_selector.appendChild(option);
          }
          sub_cat_selector.options.selected = "selected";
        }
      }
    }
  })
}
function send_edit(place_id) {
  let destination_update = document.querySelector('#edit_destination').value;
  let category_update = document.querySelector('#edit_category').value;
  let subcategory_update = document.querySelector('#edit_subcategory').value;
  let infos_update = document.querySelector('#edit_placeinfos').value;


  let updated_place = {};
  updated_place.dest_update = destination_update;
  updated_place.cat_update = category_update;
  updated_place.subcat_update = subcategory_update;
  updated_place.infos_update = infos_update;

  let route = `update_place/${place_id}`;
  fetch(route, {
    method: 'POST',
    body: JSON.stringify({
      updated_place: updated_place
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Reload the place:
    load_place(data.place.id, data.place.place_destination_id);
  })

}

//************************************
// Comment Place :
//************************************
function comment_place(place) {
  // Pop up the modal to edit the place:
  const comment_modal = new bootstrap.Modal(document.getElementById('comment_place_modal'), backdrop=true);
  // Set the modal title:
  document.querySelector('#comment_modal_title').innerHTML = `Comment for place "${place.place_name}"`;
  document.querySelector('#comment_text').value = "";

  // Show the modal:
  comment_modal.show();

  // Save the comment:
  document.querySelector('#save_comment_button').onclick = function() {
    let comment_text = document.querySelector('#comment_text').value;
    save_comment(place.id, comment_text);

    // Hide the modal:
    comment_modal.hide();
  }
}
function save_comment(place_id, comment_text) {
  console.log(place_id);
  console.log(comment_text);

  let route = `comment_place/${place_id}`
  fetch(route, {
    method: 'POST',
    body: JSON.stringify({
      comment_text: comment_text
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    load_comments(place_id);
  })
}

//************************************
// Show places of a destination on a map:
//************************************
function toggle_map() {

  if (document.querySelector('#places_map').style.display == "block") {
    document.querySelector('#places_container').style.display = "block";
    document.querySelector('#places_map').style.display = "none";
    document.querySelector('#places_on_map_button').innerHTML = "See Places on Map";
  } else {
    document.querySelector('#places_container').style.display = "none";
    document.querySelector('#places_map').style.display = "block";
    document.querySelector('#places_on_map_button').innerHTML = "Places List View";
    //document.querySelector('#places-infowindow-content').style.display = "none";
  }
}
function show_places_on_map(places) {
  // First, clear the inforwindow-box container:
  document.querySelector('#places-infowindow-container').innerHTML = "";

  // Hide the list view and show the map view:
  toggle_map();

  // Add the toggle view function to the respective button to switch between list and map view:
  document.querySelector('#places_on_map_button').onclick = function() {
    toggle_map();
  }

  // Create a map:
  const map1 = new google.maps.Map(document.getElementById("places_map"), {
    center: { lat: 47.4, lng: 8.5 },
    zoom: 11,
    mapId: "58fbe1d4b7afdb78"
  });
  var bounds = new google.maps.LatLngBounds();

  // Create info window:
  infowindows = [];
  markers = [];
  var counter = 0;
  let place_id = 0;

  for (place of places) {
    //console.log(place);

    // if the place has coordinates, create a marker and infowindow:
    if (place.place_lat !== null) {
      // First, create the infowindow_box for the place:
      let infowindow_box = document.createElement('div');
      infowindow_box.id = "infowindow_box" + place.id;
      let infowindow_box_title = document.createElement('div');
      infowindow_box_title.id = "infowindow_box_title" + place.id;
      infowindow_box_title.style = "font-weight: bold";
      infowindow_box.appendChild(infowindow_box_title);
      let infowindow_box_text = document.createElement('div');
      infowindow_box_text.id = "infowindow_box_text" + place.id;
      infowindow_box.appendChild(infowindow_box_text);
      let infowindow_box_link = document.createElement('a');
      infowindow_box_link.id = "infowindow_box_link" + place.id;
      infowindow_box_link.href = "#";
      infowindow_box_link.innerHTML = "Go to Place";

      infowindow_box_link.addEventListener('click', load_place.bind(this, place.id, place.place_destination_id), false);


      infowindow_box.appendChild(infowindow_box_link);
      document.querySelector('#places-infowindow-container').appendChild(infowindow_box);

      // For each place create the info window:
      const infowindow = new google.maps.InfoWindow();
      const infowindowContent = document.getElementById(infowindow_box.id);

      infowindow.setContent(infowindowContent);
      infowindow.close();

      // Add it to the infowindows array:
      infowindows.push(infowindow);


      let place_lat = parseFloat(place.place_lat);
      let place_lng = parseFloat(place.place_lng);

      // Create a marker:
      const marker = new google.maps.Marker({ map: map1 });
      // Set the position of the marker using the place ID and location.
      marker.setPlace({
        placeId: place.place_id,
        location: {lat: place_lat, lng: place_lng}
      });
      marker.setVisible(true);
      bounds.extend({lat: place_lat, lng: place_lng})

      markers.push(marker);

      infowindowContent.children[infowindow_box_title.id].textContent = place.place_name;
      infowindowContent.children[infowindow_box_text.id].textContent = place.place_address;
      infowindowContent.children[infowindow_box_link.id].textContent = "See Place";

      // Increment counter:
      counter++;
    }
  }

  // Add the onclick-event to all the markers:
  let place_count = markers.length;
  for (let i = 0; i < place_count; i++){
    markers[i].addListener("click", () => {
      for (let j = 0; j < place_count; j++) {
        infowindows[j].close();
      }
      infowindows[i].open(map1, markers[i]);
    });
    markers[i].addListener("mouseover", () => {
      for (let j = 0; j < place_count; j++) {
        infowindows[j].close();
      }
      infowindows[i].open(map1, markers[i]);
    });
    infowindows[i].close();
  }

  map1.fitBounds(bounds);
}

function filter_places(places, selected_category_value) {
  // Filter out manual places as they dont have a marker:
  let google_places = [];
  for (place of places) {
    if (place.place_id != null) {
      google_places.push(place);
    }
  }

  // Loop over all google-places and hide if they don't belong to the selected category:
  for (let i = 0; i < google_places.length; i++) {
    let category = "category" + google_places[i].place_category_id;
    if (category === selected_category_value) {
      markers[i].setVisible(true);
    } else {
      markers[i].setVisible(false);
      infowindows[i].close()
    }
  }
}
