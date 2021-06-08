from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'layover_app/index.html')

def login_view(request):
    pass

def logout_view(request):
    pass

def register(request):
    pass
