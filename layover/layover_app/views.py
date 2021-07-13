import json
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError

from .models import User, Destination, Place

# Create your views here.
def start(request):
    return render(request, 'layover_app/start.html')

def index(request):
    return render(request, 'layover_app/index.html')

def login_view(request):
    # If user is submitting the login form:
    if request.method == "POST":
        # Get username and password from the form:
        username = request.POST["username"]
        password = request.POST["password"]
        # Try to authenticate the user:
        user = authenticate(request, username=username, password=password)
        print(user)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, 'layover_app/login.html', {
                "message": "Invalid username and/or password"
            })
    # If user is calling the login page:
    else:
        return render(request, "layover_app/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

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
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "layover_app/register.html")
