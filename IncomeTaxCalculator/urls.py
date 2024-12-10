from django.urls import path
from . import views

urlpatterns = [
    path('calculator/', views.calculator_page, name='calculator'),
    path('calculator/calculate_income/', views.calculate_income, name='calculator_income'),
]