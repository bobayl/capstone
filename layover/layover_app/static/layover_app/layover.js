// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "none";

  // Start with showing all destinations:
  show_destinations();

  // Toggle with Nav-Bar-Links:
  document.querySelector('#add_new_menue').addEventListener('click', () => {
    add_place();
  });
  document.querySelector('#show_start_page').addEventListener('click', () => {
    show_start_page();
  });
  document.querySelector('#destinations_view').addEventListener('click', () => {
    show_destinations();
  });
});

function show_start_page() {
  document.querySelector('#start_page').style.display = "block";
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "none";
}

//************************************
// Show the destinations overview:
//************************************
function show_destinations() {
  // Display the destinations div:
  document.querySelector('#destinations').style.display = "block";
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "none";

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
      let destination_title = document.createElement('h3');
      let destination_id = destination.id;
      destination_title.innerHTML = destination.destination_name;
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
      destination_tile.append(destination_title);
      document.querySelector('#destinations_container').append(destination_tile);
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
  // Clear the form:
  document.querySelector('#add_destination_form').reset();
  // Force the IATA code to be all capitals:
  document.querySelector('#new_destination_iata').onkeyup = function(){
    this.value = this.value.toUpperCase();
  }
  // Create the destination object:
  const new_destination = {};

  // Add click event listener to the submit button:
  document.querySelector('#save_destination').onclick = function() {
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
      if (response.status == 409) {
        document.querySelector('#destination_conflict').style.display = "block";
      }
      return response.json();
    })
    .then(data => {
      if (data["status"] === 201) {
        if (document.querySelector('#destinations').style.display == "block"){
          show_destinations();
          destination_modal.hide();
        } else {
          update_destination_selector();
          destination_modal.hide();
        }
      }
    });
  }
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
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#places').style.display = "block";

  // fetch all the places for the selected destination:
  let route = `show_destination/${destination_id}`;
  fetch(route, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    let destination = data["destination"];
    let places = data["places"];
    let categories = data["categories"];

    // Fill destination title:
    document.querySelector("#destination_title").innerHTML = destination["destination_name"];

    // List all places:
    list_places(places, categories);
  });
}
//************************************
// Lists all the places in the destination view:
//************************************
function list_places(places, categories) {

  // Loop over the categories:
  for (category of categories) {
    // Create a category container:
    let category_container = document.createElement('div');
    // Create category title:
    let category_title = document.createElement('h2');
    category_title.className = "fw-light";
    category_title.innerHTML = category.category_name;
    category_container.appendChild(category_title);
    // Create the card group for the category:
    let card_group = document.createElement('div');
    card_group.className = "card-group";

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
        place_title.claclassNamess = "card-title";
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

        place_card.addEventListener('click', () => {
          // Load the place:
          load_place(place_card.id);
        })
        card_group.appendChild(place_card);
      }
    }
    category_container.appendChild(card_group);
    document.querySelector('#places').appendChild(category_container);
  }
}

//************************************
// Load place function:
//************************************
function load_place(place_id){

  // Display the place details block:
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#add_new').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "block";

  // Fetch the place details:
  fetch(`load_place/${place_id}`)
  .then(response => response.json())
  .then(data => {
    let place = data.place;
    //console.log(place);
    // Update the title:
    document.querySelector('#place_title').innerHTML = place.place_name;
    // Update the place author:
    document.querySelector('#place_author').innerHTML = `Place selected by ${place.place_author}`;
    // Setting the background image:
    document.querySelector('#place_header').style.backgroundImage = `url(${place.place_image_url})`;

    // Update place info:
    if (place.place_infos.length > 5) {
      document.querySelector('#place_info').innerHTML = place.place_infos;
    } else {
      document.querySelector('#place_info').innerHTML = "No place description by the author yet.";
    }

    document.querySelector('#place_name').innerHTML = place.place_name;
    document.querySelector('#place_address').innerHTML = "  " + place.place_address;
    document.querySelector('#place_website').innerHTML = "  " + place.place_website;
    document.querySelector('#place_phone').innerHTML = "  " + place.place_phone;
    document.querySelector('#place_category').innerHTML = "Category:  " + place.place_category;
    document.querySelector('#place_subcategory').innerHTML = "Subcategory  " + place.place_subcategory;
    document.querySelector('#place_googlemaps').href = "  " + place.place_googlemaps;
    document.querySelector('#place_author2').innerHTML = "  " + place.place_author;

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
          data.photos &&
            data.photos.forEach(photo => {
              place_photos.push(photo.getUrl());
            });

            //display the photos:
            // Loop over the images:
            for (photo of place_photos){
              console.log("in here");
              let place_photo_tile = document.createElement('div');
              let place_photo = document.createElement('img');
              place_photo.src = `${photo}`;
              place_photo_tile.append(place_photo);
              document.querySelector('#place_details_images').append(place_photo_tile);
            }
          }
        });
  })
}


//************************************
// Shows the add_place view to let the user to search Google Maps places:
//************************************
function add_place() {
  document.querySelector('#pac-input').value = "";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#start_page').style.display = "none";
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#add_new').style.display = "block";
  document.querySelector('#place_form').style.display = "none";
  document.querySelector('#place_images_for_selection_container').style.display = "none";
  document.querySelector('#place_add_success').style.display = "none";
  document.querySelector('#place_exists').style.display = "none";

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
      let destination = document.getElementById("id_place_destination");
      let category = document.getElementById("id_place_category");
      let subcategory = document.getElementById("id_place_subcategory");
      // Check if destination and category have values:
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
      if (category.value && destination.value && subcategory.value) {
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

  place.place_destination = document.getElementById("id_place_destination").value;
  place.place_category = document.getElementById("id_place_category").value;
  place.place_subcategory = document.getElementById("id_place_subcategory").value;
  place.place_infos = document.getElementById("id_place_infos").value;
  place.place_image_url = title_image_url;

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
      }
      return response.json();
    })
    .then(data => {
      // Empty the form:
      document.querySelector("#new_place_form").reset();
      document.querySelector("#pac-input").value = "";
      document.querySelector("#place_form").style.display = "none";
      document.querySelector('#place_images_for_selection_container').style.display = "none";
    });
  }
}
