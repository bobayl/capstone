from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

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
    path("add_subcategory", views.add_subcategory, name="add_subcategory"),
    path("load_place/<str:place_id>", views.load_place, name="load_place"),
    path("save_destination_image/<int:dest_id>", views.save_destination_image, name="save_destination_image"),
    path("my_places", views.my_places, name="my_places"),
    path("update_destinations_and_categories", views.update_destinations_and_categories, name="update_destinations_and_categories"),
    path("update_place/<int:place_id>", views.update_place, name="update_place")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
