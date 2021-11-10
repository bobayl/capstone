CS50 FINAL PROJECT APP: "LAYOVER"

INTRODUCTION
What is the purpose of "LAYOVER"? Think of it being a "TripAdvisor"-like application, designed and tailored especially for airline flight and cabin crew. They fly to and stay for short periods (24hrs up to 1 week) at different destinations again and again. It shall allow them to share their best experiences (restaurants, excursions, sports, shopping tipps and more) amongst each other within the company. First-timers at a destination (which can be the entire crew if the airline is flying to a new destination in its route network) spend a lot of time to find the best places and then these places are normally shared mouth-to-mouth. Some very special places and hidden secrets get "lost" when a crew member resigns or retires or do not even get "spread" amongst other colleagues.

My solution to this day-to-day problem is mainly making use of GOOGLE's Places API.

HOW DOES IT WORK FOR THE USER
After signing up (sign up process currently not yet restricted), users can add places to existing destinations in the app but also add new destinations as the airline network is constantly changing. The user can use the Google Places Autocomplete API function to search for Google places and add them. Places that do not exist in Google Places can also be added manually. To add a place, the user selects the destination, the category, subcategory (a new one can be created if necessary), picks a title image from a customised Google search (or selects one of his own images) and can optionally add a written description.

Places can be edited by the user who added them (and even be deleted). Places can be commented by other users.

For each destination exists a list view of all places, sorted by category. The user can switch to a map view displaying Google Maps markers for all the places of that destination.

All created and selected places are stored in our own database including the title image and all information about the place (address, phone number, website, Google Maps link, etc.). At the current stage, the database is not yet periodically checked and updated for changes yet. That would be one of many possible future app updates.

WHY "LAYOVER" IS DISTINCT AND COMPLEX ENOUGH AS FINAL PROJECT OF CS50WEB
The project is distinct from all other project in the CS50 Web course and meets the complexity requirements for the following reasons:
1) Distinctiveness: It incorporates several features that were not used in other projects:
  a) It includes and makes extensive use of the Google Places API
  b) It includes a customized Google Search Engine (cse) to browse the web for selecting title images.
  c) It makes use of the Django File Storage System (to save title images)
  d) It incorporates the Javascript History API
  e) It includes a password resetting system
2) Complexity:
  While completing this project I faced several features that I wanted to implement that I hadn't used in other projects:
  a) Using and adjusting drop down selectors that change the content based on other selectors.
  b) Using bootstrap components like modals, carousels, cards
  c) Display selected places on a Google map and adding the ability to filter these places according to a selected category.
  d) Despite it is a single page app, I spent quite some time on the URL system, so any page can be reloaded or a link can be copy-pasted as well as making use of the history API.
3) Most important concerning distinctiveness: *** I didn't find anything like it so far and there is a need for it. ***

WHAT IS CONTAINED IN EACH FILE
1) Javascript files "layover.js" and "google_maps.js": Contain all the javascript code for the application.
2) styles.css: Stylesheet of the application
3) templates:
  a) layout.html: General html layout
  b) index.html: Main html page containing all html of the project.
  c) register.html, login.html: Register and login pages
  d) reset_password.html, password_reset_done.html, password_reset_form.html, password_reset_sent.html: Pages needed for the password reset process
4) models.py: contains the 6 models used in this project: USER, DESTINATION, CATEGORY, SUBCATEGORY, PLACE, COMMENT
5) views.py: All Django views of the application

HOW TO RUN THE APPLICATION
For the application to run properly, one needs 2 things:
1) Google Maps API KEY: Go to https://console.cloud.google.com/google/maps-apis and create an API key for Google Maps API. Once you have that, in "views.py" and in "index.html" replace YOUR_API_KEY with the API-Key you generated.
2) (Optional) For the password resetting to work, you need to fill some email-account credentials in the "settings.py" file: If you want to use a GMAIL account, just replace the email address and the password with your credentials.
