from django. urls import path
from core import views

urlpatterns = [
    path('processUser/', views.processUser, name='processUser')
]