from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
import datetime

# Create your models here.
class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"

class Destination(models.Model):
    destination_name = models.CharField(max_length = 60)
    destination_iata = models.CharField(max_length = 3)
    destination_img_url = models.CharField(max_length = 1000, default = "")
    destination_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.destination_name}"

    def serialize(self):
        return {
            "id": self.id,
            "destination_name": self.destination_name,
            "destination_iata": self.destination_iata,
            "destination_img":self.destination_img_url
        }

class Category(models.Model):
    category_name = models.CharField(max_length = 40)

    def __str__(self):
        return f"{self.category_name}"

    def serialize(self):
        return {
            "id": self.id,
            "category_name": self.category_name,
            "subcategories": [sub.subcategory for sub in Subcategory.objects.filter(category = self)]
        }

class Subcategory(models.Model):
    subcategory = models.CharField(max_length = 30, default="other")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.subcategory}"

    def serialize(self):
        return {
            "id": self.id,
            "subcategory_name": self.subcategory,
            "category": self.category.category_name
        }

class Place(models.Model):
    place_name = models.CharField(max_length = 200)
    place_destination = models.ForeignKey(Destination, on_delete = models.CASCADE)
    place_category = models.ForeignKey(Category, on_delete = models.CASCADE)
    place_subcategory = models.ForeignKey(Subcategory, on_delete = models.CASCADE, blank=True, null=True)
    place_google_id = models.CharField(max_length = 200, blank=True, null=True)
    place_address = models.CharField(max_length = 300, blank=True, null=True)
    place_phone = models.CharField(max_length = 20, blank=True, null=True)
    place_website = models.URLField(max_length = 250, blank=True, null=True)
    place_email = models.EmailField(max_length = 254, blank=True, null=True)
    place_googlemaps = models.URLField(max_length = 250, blank=True, null=True)
    place_date_added = models.DateTimeField(auto_now_add = True)
    place_author = models.ForeignKey(User, on_delete = models.DO_NOTHING, null=True)
    place_infos = models.TextField(max_length = 400, blank=True)
    place_status = models.BooleanField(default = True)
    place_image_url = models.CharField(max_length = 3000, default = "", blank=True, null=True)
    place_lat = models.DecimalField(max_digits = 12, decimal_places = 10, default = 50.0, blank=True, null=True)
    place_lng = models.DecimalField(max_digits = 13, decimal_places = 10, default = 0.0, blank=True, null=True)

    def __str__(self):
        return f"{self.place_name} in {self.place_destination}"

    def serialize(self):
        return {
            "id": self.id,
            "place_name": self.place_name,
            "place_destination": self.place_destination.destination_name,
            "place_destination_id": self.place_destination.id,
            "place_category": self.place_category.category_name,
            "place_category_id": self.place_category.id,
            "place_subcategory": self.place_subcategory.subcategory,
            "place_address": self.place_address,
            "place_phone": self.place_phone,
            "place_website": self.place_website,
            "place_email": self.place_email,
            "place_googlemaps": self.place_googlemaps,
            "place_date_added": self.place_date_added.strftime("%b %-d %Y"),
            "place_author": self.place_author.username,
            "place_infos": self.place_infos,
            "place_status": self.place_status,
            "place_id": self.place_google_id,
            "place_image_url": self.place_image_url,
            "place_lat": self.place_lat,
            "place_lng": self.place_lng
        }

class Comment (models.Model):
    comment_place = models.ForeignKey(Place, on_delete=models.CASCADE)
    comment_author = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    comment_timestamp = models.DateTimeField(auto_now_add = True)
    comment_text = models.CharField(max_length = 1000)

    def __str__(self):
        return f"{self.comment_author} on {self.comment_place}"

    def serialize(self):
        return {
            "id": self.id,
            "place": self.comment_place.place_name,
            "author": self.comment_author.username,
            "timestamp": self.comment_timestamp.strftime("%b %-d %Y"),
            "text": self.comment_text
        }
