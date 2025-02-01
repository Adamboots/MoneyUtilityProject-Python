from django.urls import path
from . import views

urlpatterns = [
    path('income_calculator/', views.calculator_page, name='calculator'),
    path('income_calculator/calculate_income/', views.request_calculate_income, name='calculate_income'),
    path('income_calculator/generate_income_ranges/', views.request_generate_income_ranges, name='generate_income_ranges'),
]