# Create your views here.
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse


def landing_page(request):
    template = loader.get_template('landing_page.html')
    return HttpResponse(template.render())