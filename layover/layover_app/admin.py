from django.contrib import admin
from .models import User, Destination, Place, Category, Subcategory

# Register your models here.
admin.site.register(User)
admin.site.register(Destination)
admin.site.register(Place)
admin.site.register(Category)
admin.site.register(Subcategory)
