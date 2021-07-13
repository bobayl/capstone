from django.urls import path
from . import views

urlpatterns = [
    path("", views.start, name="start"),
    path("index", views.index, name="index"),
    path("login_view", views.login_view, name="login_view"),
    path("logout_view", views.logout_view, name="logout_view"),
    path("register", views.register, name="register")
]
