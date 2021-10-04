import json
import urllib.request
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.forms import ModelForm
from django import forms
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from django.core.files import File
from apiclient.discovery import build

from .models import User, Destination, Place, Category, Subcategory, Comment

# GOOGLE API-Key:
api_key = 'my_api_key'
# Google Custom Search Engine ID:
cx = '949f3af724dcd2f56'

# Create your views here.

def index(request):
    return render(request, 'layover_app/index.html', {
        "place_form": PlaceForm()
    })

@csrf_exempt
def load_place(request, place_id):
    if request.method == "GET":
        place = Place.objects.get(pk = place_id)
        place_serialized = place.serialize()

        if place.place_author == request.user:
            is_editable = True
        else:
            is_editable = False
        return JsonResponse({"place": place_serialized, "is_editable": is_editable}, status=200)
    else:
        return JsonResponse({"error": "GET request required"}, status=400)

@login_required
@csrf_exempt
def update_destinations_and_categories(request):
    if request.method == "POST":
        return JsonResponse({"error": "GET request required."}, status=400)
    else:
        destinations = Destination.objects.all().order_by('destination_name')
        destinations = [destination.serialize() for destination in destinations]
        categories = Category.objects.all()
        categories = [category.serialize() for category in categories]
        return JsonResponse({"destinations": destinations, "categories": categories}, status=200)

@login_required
@csrf_exempt
def update_place(request, place_id):
    if request.method == "GET":
        return JsonResponse({"error": "POST request required"}, status=400)
    else:
        # Load the data:
        data = json.loads(request.body)
        update = data.get("updated_place")

        # Get the updated data:
        place_destination = update.get("dest_update")
        place_category = update.get("cat_update")
        place_subcategory = update.get("subcat_update")
        place_infos = update.get("infos_update")

        # Get the place object:
        place = Place.objects.get(id=place_id)
        # Get the destination and category objects:
        destination = Destination.objects.get(destination_iata = place_destination)
        category = Category.objects.get(category_name = place_category)
        subcategory = Subcategory.objects.get(subcategory = place_subcategory)

        # Update the place:
        place.place_destination = destination
        place.place_category = category
        place.place_subcategory = subcategory
        place.place_infos = place_infos

        # Save the update:
        place.save()

        updated_place = place.serialize()

        return JsonResponse({"success": "Place listing updated", "place":updated_place}, status=200)

@login_required
@csrf_exempt
def add_subcategory(request):
    if request.method == "POST":
        # Load the data:
        data = json.loads(request.body)
        print(data)
        category = data.get("category")
        category_obj = Category.objects.get(pk=int(category))
        new_subcategory = data.get("new_subcategory")
        print(category)
        print(new_subcategory)
        # Create and save the new subcategory:
        new_subcat_obj = Subcategory(subcategory = new_subcategory, category = category_obj)
        new_subcat_obj.save()
        return JsonResponse({"success": "New subcategory created"}, status=201)
    else:
        return JsonResponse({"error": "POST request required"}, status=400)

@login_required
@csrf_exempt
def add_destination(request):
    if request.method == "POST":
        print("post request new destination received")
        # Load the data:
        data = json.loads(request.body)
        destination = data.get("destination")

        # Get the new destination data:
        new_destination_name = destination.get("destination_name")
        new_destination_iata = destination.get("destination_iata")
        # Put the destination into the right format:
        new_destination_name = new_destination_name.capitalize()
        new_destination_iata = new_destination_iata.upper()
        print(new_destination_name)
        print(new_destination_iata)

        # Check if the destination already exists (based on name and/or IATA code):
        check_destination = Destination.objects.filter(destination_iata = new_destination_iata)
        if len(check_destination) > 0:
            return JsonResponse({
            "error": "Destination already exists in the database",
            "status": 409
            }, status=409)
        else:
            # Create a new Destination instance:
            new_destination = Destination(destination_name = new_destination_name, destination_iata = new_destination_iata, destination_active = True)
            new_destination.save()

            # Get destination images from Google:
            resource = build("customsearch", 'v1', developerKey=api_key).cse()
            result = resource.list(q=f'{new_destination_name}', cx=cx, searchType='image').execute()
            image_links = []
            for item in result['items']:
                image_links.append(item['link'])
            print(image_links)

            # Get the new destination-ID:
            n = Destination.objects.get(destination_iata = new_destination_iata)
            new_dest_id = n.id
            print(new_dest_id)

            return JsonResponse({
            "destination_id": new_dest_id,
            "image_links": image_links,
            "success": "New destination added.",
            "status": 201
            }, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

@login_required
@csrf_exempt
def save_destination_image(request, dest_id):
    if request.method == "POST":
        print("new destination img received")
        # Load the data:
        data = json.loads(request.body)
        destination_img = data.get("destination_img")
        print(destination_img)
        dest_img_url = destination_img.get("url");

        # Retrieve the image from the place_image_url:
        try:
            urllib.request.urlretrieve(dest_img_url, "dest_image")
        except HTTPError:
            return JsonResponse({"error": "Error occured while saving this image. Please select a different image."}, status=403)

        #f = open("title_image", newline='', encoding="utf16")
        with open("dest_image", 'rb') as f:
            myfile = File(f)

            print(myfile.name)
            print(myfile.size)

            fs = FileSystemStorage()
            name = fs.save(myfile.name, myfile)
            print(name)
            url = fs.url(name)
            print(url)

        # Set the local url to the title image:
        dest_image_url = "/layover_app" + url
        print(dest_image_url)

        # Get the respective destination model and update its img_url property:
        d = Destination.objects.get(pk = dest_id)
        d.destination_img_url = dest_image_url
        d.save()

        return JsonResponse({"success": "Destination image added"}, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
def show_destinations(request):
    if request.method == "POST":
        return JsonResponse({"error": "GET request required."}, status=400)
    else:
        destinations = Destination.objects.all()
        destinations = destinations.order_by('destination_name')
        destinations = [destination.serialize() for destination in destinations]
        return JsonResponse({"destinations": destinations}, status=200)

@csrf_exempt
def show_destination(request, destination_id):
    if request.method == "POST":
        return JsonResponse({"error": "GET request required."}, status=400)
    else:
        if request.user.is_authenticated:
            # Get and return the destination:
            destination = Destination.objects.get(pk = int(destination_id))
            destination = destination.serialize()

            # Get the categories and subcategories:
            categories = Category.objects.all()
            categories = [category.serialize() for category in categories]

            # Get the places of the selected destination:
            places = Place.objects.filter(place_destination__id = destination_id).order_by('place_category')
            places_serialized = [place.serialize() for place in places]

            # Make a place editable if the author is the logged in user:
            editable = []
            for place in places:
                if place.place_author == request.user:
                    editable.append(True)
                else:
                    editable.append(False)
            print(editable)

            return JsonResponse({
                "destination": destination,
                "places": places_serialized,
                "categories": categories,
                "editable": editable
                }, status=200)
        else:
            print("not authenticated")
            return JsonResponse({"error": "Please log in or register to see places"}, status=401)

@csrf_exempt
@login_required
def place_exists(request, place_id):
    if request.method == "GET":
        if len(Place.objects.filter(place_google_id = place_id)) > 0:
            return JsonResponse({"message": "Sorry, this place already exists in our database."}, status=409)
        else:
            return JsonResponse({"message": "Not yet in database"}, status=202)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

@csrf_exempt
@login_required
def add_place(request):
    # Posting must be via POST request
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)
        print(data)
        place = data.get("place")
        # Get all the place data:
        place_name = place.get("place_name")
        place_destination = Destination.objects.get(pk=int(place.get("place_destination")))
        place_category = Category.objects.get(pk=int(place.get("place_category")))
        place_subcategory = Subcategory.objects.get(pk=int(place.get("place_subcategory")))
        place_google_id = place.get("place_google_id")
        place_rating = place.get("place_rating")
        place_address = place.get("place_address")
        place_phone = place.get("place_phone")
        place_website = place.get("place_website")
        place_googlemaps = place.get("place_googlemaps")
        place_author = request.user
        place_infos = place.get("place_infos")
        place_image_url = place.get("place_image_url")
        place_image = place.get("place_image")
        place_lat = place.get("place_lat")
        place_lng = place.get("place_lng")

        print(f"place_image: {place_image}")

        # Retrieve the image from the place_image_url and save it in the database:
        # Retrieve the image from the place_image_url:
        if place_image_url:
            urllib.request.urlretrieve(place_image_url, "title_image")

            #f = open("title_image", newline='', encoding="utf16")
            with open("title_image", 'rb') as f:
                myfile = File(f)

                print(myfile.name)
                print(myfile.size)

                fs = FileSystemStorage()
                name = fs.save(myfile.name, myfile)
                print(name)
                url = fs.url(name)
                print(url)

            # Set the local url to the title image:
            place_image_url = "/layover_app" + url
            print(place_image_url)
        else:
            place_image_url = "";


        # Check if place already in database:
        # The first if-clause checks if there is a google id at all:
        if place_google_id:
            # If there is a google_id, then check if that google_id already exists in the database
            if len(Place.objects.filter(place_google_id = place_google_id)) > 0:
                return JsonResponse({"message": "Sorry, this place already exists in our database."}, status=409)
            else:
                new_place = Place(place_name = place_name, place_destination = place_destination, place_category = place_category, place_subcategory = place_subcategory, place_google_id = place_google_id, place_address = place_address, place_phone = place_phone, place_website = place_website, place_googlemaps = place_googlemaps, place_author = place_author, place_infos = place_infos, place_image_url = place_image_url, place_status = True, place_lat = place_lat, place_lng = place_lng)
                new_place.save()

                return JsonResponse({"message": "Successully submitted place. Thanks."}, status=201)
        else:
            new_place = Place(place_name = place_name, place_destination = place_destination, place_category = place_category, place_subcategory = place_subcategory, place_google_id = place_google_id, place_address = place_address, place_phone = place_phone, place_website = place_website, place_googlemaps = place_googlemaps, place_author = place_author, place_infos = place_infos, place_image_url = place_image_url, place_status = True, place_lat = place_lat, place_lng = place_lng)
            new_place.save()

            return JsonResponse({"message": "Successully submitted place. Thanks."}, status=201)

@csrf_exempt
@login_required
def comment_place(request, place_id):
    if request.method == "POST":
        # Load the data:
        data = json.loads(request.body)
        # Fill the comment model variables
        comment_text = data.get("comment_text")
        comment_place = Place.objects.get(pk = place_id)
        comment_author = request.user

        # Create new comment object:
        comment = Comment(comment_place = comment_place, comment_author = comment_author, comment_text = comment_text)
        # Save the comment object:
        comment.save()
        return JsonResponse({"success": "Comment successfully saved"}, status=201)
    elif request.method == "GET":
        # Filter the comments:
        comments = Comment.objects.filter(comment_place__id = place_id)
        comments = [comment.serialize() for comment in comments]
        return JsonResponse({"comments": comments}, status=200)
    else:
        return JsonResponse({"error": "POST or GET request required"}, status=400)

@csrf_exempt
@login_required
def my_places(request):
    if request.method == 'GET':
        user = request.user
        my_places = Place.objects.filter(place_author = user).order_by('place_destination__destination_name')
        my_places = [place.serialize() for place in my_places]

        my_destinations = []
        for place in my_places:
            if not place["place_destination"] in my_destinations:
                my_destinations.append(place["place_destination"])

        return JsonResponse({"my_places": my_places, "my_destinations": my_destinations}, status = 200)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

@csrf_exempt
@login_required
def delete_place(request, place_id):
    if request.method == 'DELETE':
        place = Place.objects.get(pk = place_id)
        place.delete()
        return JsonResponse({"success": "Place deleted."}, status=200)
    else:
        return JsonResponse({"error": "DELETE request required."}, status=400)

def load_subcategories(request, category_id):
    if request.method == "GET":
        subcategories = Subcategory.objects.filter(category__id = category_id)
        subcategories = [subcategory.serialize() for subcategory in subcategories]
        return JsonResponse({"subcategories": subcategories}, status=200)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

def login_view(request):
    # If user is submitting the login form:
    if request.method == "POST":
        # Get username and password from the form:
        username = request.POST["username"]
        password = request.POST["password"]
        # Try to authenticate the user:
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('layover_app:index'))
        else:
            return render(request, 'layover_app/login.html', {
                "message": "Invalid username and/or password"
            })
    # If user is calling the login page:
    else:
        return render(request, "layover_app/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('layover_app:index'))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "layover_app/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()

        except IntegrityError:
            return render(request, "layover_app/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("layover_app:index"))
    else:
        return render(request, "layover_app/register.html")


# Create Model Forms:
class NewDestinationForm(forms.Form):
    new_destination = forms.CharField(max_length = 20)
    new_destination_iata = forms.CharField(max_length = 3)

class PlaceForm(ModelForm):
    class Meta:
        model = Place
        fields = [
            'place_name',
            'place_destination',
            'place_category',
            'place_subcategory',
            'place_address',
            'place_phone',
            'place_website',
            'place_email',
            'place_infos'
        ]
        labels = {
            'place_name': "Name",
            'place_destination': "Select Destination*",
            'place_category': "Select Category*",
            'place_subcategory': "Select Subcategory (optional)",
            'place_address': "Address",
            'place_phone': "Phone",
            'place_website': "Website",
            'place_email': "Email (optional)",
            'place_infos': "Your personal infos about the venue"
            }
        required = ['place_name', 'place_destination', 'place_category']
        widgets = {
            'place_name': forms.TextInput(
                attrs={
                    'class': 'form-control', 'disabled': 'true'
                    }
                ),
            'place_destination': forms.Select(
                attrs={
                    'class': 'form-select'
                    }
                ),
            'place_category': forms.Select(
                attrs={
                    'class': 'form-select'
                    }
                ),
            'place_subcategory': forms.Select(
                attrs={
                    'class': 'form-select'
                    }
                ),
            'place_address': forms.TextInput(
                attrs={
                    'class': 'form-control', 'disabled': 'true'
                    }
                ),
            'place_phone': forms.TextInput(
                attrs={
                    'class': 'form-control', 'disabled': 'true'
                    }
                ),
            'place_website': forms.TextInput(
                attrs={
                    'class': 'form-control', 'disabled': 'true'
                    }
                ),
            'place_email': forms.TextInput(
                attrs={
                    'class': 'form-control'
                    }
                ),
            'place_infos': forms.Textarea(
                attrs={
                    'class': 'form-control', 'placeholder': "Leave your personal infos if you want.", 'style': 'height: 100px'
                    }
                )
            }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['place_subcategory'].queryset = Subcategory.objects.none()
        self.fields['place_destination'].queryset = Destination.objects.none()
