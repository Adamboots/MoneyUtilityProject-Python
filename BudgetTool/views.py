# Create your views here.
import html
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Views to return templates
def budget_tool_page(request):
    template = loader.get_template('page_budget_tool.html')
    return HttpResponse(template.render())