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

    def __str__(self):
        return f"{self.destination_name}"

class Place(models.Model):
    place_name = models.CharField(max_length = 150)
    place_destination = models.ForeignKey(Destination, on_delete = models.CASCADE)
    place_website = models.CharField(max_length = 300)
