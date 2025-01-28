from django.urls import path
from . import views

urlpatterns = [
    path('calculator/', views.calculator_page, name='calculator'),
    path('calculator/calculate_income/', views.request_calculate_income, name='calculator_income'),
    path('calculator/generate_income_ranges/', views.request_generate_income_ranges, name='calculator_income'),
]