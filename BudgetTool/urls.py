from django.urls import path
from . import views

urlpatterns = [
    path('budget-tool/', views.budget_tool_page, name='budget_tool_page'),
]