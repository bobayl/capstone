from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

app_name = "layover_app"

urlpatterns = [
    path("", views.index, name="index"),
    path("destinations", views.index, name="destinations"),
    path("login_view", views.login_view, name="login_view"),
    path("logout_view", views.logout_view, name="logout_view"),
    path("register", views.register, name="register"),
    path("add_place", views.add_place, name="add_place"),
    path("addPlace", views.add_place, name="addPlace"),
    path("myPlaces", views.myPlaces, name="myPlaces"),
    path("home", views.home, name="home"),
    path("page/<str:page_name>", views.page, name="page"),
    path("destinations/<str:dest_iata>/<int:place_id>", views.place_url, name="place_url"),
    path("destinations/<str:dest_iata>", views.dest_url, name="dest_url"),

    # API Routes:
    path("show_destinations", views.show_destinations, name="show_destinations"),
    path("show_destination/<int:destination_id>", views.show_destination, name="show_destination"),
    path("load_subcategories/<int:category_id>", views.load_subcategories, name="load_subcategories"),
    path("place_exists/<str:place_id>", views.place_exists, name="place_exists"),
    path("add_destination", views.add_destination, name="add_destination"),
    path("add_subcategory", views.add_subcategory, name="add_subcategory"),
    path("load_place/<str:place_id>", views.load_place, name="load_place"),
    path("save_destination_image/<int:dest_id>", views.save_destination_image, name="save_destination_image"),
    path("my_places", views.my_places, name="my_places"),
    path("update_destinations_and_categories", views.update_destinations_and_categories, name="update_destinations_and_categories"),
    path("update_place/<int:place_id>", views.update_place, name="update_place"),
    path("comment_place/<int:place_id>", views.comment_place, name="comment_place"),
    path("delete_place/<int:place_id>", views.delete_place, name="delete_place")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
