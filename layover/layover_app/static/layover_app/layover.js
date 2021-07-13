// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#destinations').style.display = "block";
  document.querySelector('#places').style.display = "block";
  document.querySelector('#place_details').style.display = "block";
  document.querySelector('#add_new').style.display = "block";


  // Start with showing all destinations:
  show_destinations();

  // Toggle with Nav-Bar-Links:
  document.querySelector('#add_new_menue').addEventListener('click', () => {
    add_place();
  });
});

function show_destinations() {
  document.querySelector('#destinations').style.display = "block";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "none";
}

function add_place() {
  document.querySelector('#destinations').style.display = "none";
  document.querySelector('#places').style.display = "none";
  document.querySelector('#place_details').style.display = "none";
  document.querySelector('#add_new').style.display = "block";
}

function print_name() {
  console.log(place_name);
}
