from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from django.http import HttpResponse

def calculator(request, num1, num2):
    result = simple_addition(num1, num2)
    return HttpResponse(f"Calculator Page: {result}")


def simple_addition(sum1, sum2):
    return sum1 + sum2