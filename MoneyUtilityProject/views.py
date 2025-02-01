# Create your views here.
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse


def about_page(request):
    template = loader.get_template('page_about.html')
    return HttpResponse(template.render())