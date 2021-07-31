from django.urls import path
from . import views

app_name = "layover_app"

urlpatterns = [
    path("", views.index, name="index"),
    path("login_view", views.login_view, name="login_view"),
    path("logout_view", views.logout_view, name="logout_view"),
    path("register", views.register, name="register"),
    path("add_place", views.add_place, name="add_place"),

    # API Routes:
    path("show_destinations", views.show_destinations, name="show_destinations"),
    path("show_destination/<int:destination_id>", views.show_destination, name="show_destinations"),
    path("load_subcategories/<int:category_id>", views.load_subcategories, name="load_subcategories"),
    path("place_exists/<str:place_id>", views.place_exists, name="place_exists"),
    path("add_destination", views.add_destination, name="add_destination"),
    path("add_subcategory", views.add_subcategory, name="add_subcategory")
]
