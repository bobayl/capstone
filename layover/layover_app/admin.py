from django.contrib import admin
from .models import User, Destination, Place, Category, Subcategory, Comment

# Register your models here.
admin.site.register(User)
admin.site.register(Destination)
admin.site.register(Place)
admin.site.register(Category)
admin.site.register(Subcategory)
admin.site.register(Comment)
