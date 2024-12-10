# Create your views here.
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


def calculator_page(request):
    template = loader.get_template('calculator.html')
    return HttpResponse(template.render())

@csrf_exempt
def calculate_income(request):
    income = int(request.POST.get('income', 0))
    year = int(request.POST.get('year', 0))
    province = request.POST.get('province', 0)

    provincial_tax = calculate_provincial_tax(income, year, province)
    federal_tax = calculate_federal_tax(income, year)

    final_income = income - provincial_tax - federal_tax
    result = {
        "post_tax_income": final_income,
        "provincial_tax": provincial_tax,
        "federal_tax": federal_tax
    }

    return HttpResponse(json.dumps(result))

def calculate_provincial_tax(income, year, province):
    provincial_tax_brackets = get_provincial_tax_brackets(year, province)
    return calculate_tax(income, provincial_tax_brackets)

def calculate_federal_tax(income, year):
    federal_tax_brackets = get_federal_tax_brackets(year)
    return calculate_tax(income, federal_tax_brackets)

# Calculates and returns tax on the provided income
def calculate_tax(income, tax_brackets):
    remainder = income
    total_taxes = 0

    # Loop through all tax brackets that apply to the income
    for tax_rate in tax_brackets.keys():

        # Determine what sum of money is being taxed in current bracket
        income_to_tax = remainder
        taxable_income_for_bracket = tax_brackets[tax_rate]
        if income_to_tax > taxable_income_for_bracket and taxable_income_for_bracket != -1:
            income_to_tax = taxable_income_for_bracket

        # Calculate the tax to be paid in current bracket
        total_taxes += income_to_tax * (tax_rate/100)

        # Update the remaining income to be taxed
        remainder -= income_to_tax

        if remainder == 0:
            break

    return total_taxes

# Method to get provincial tax rate for the specified year
# TODO: Make this call soon to be built tax brackets API to get data
def get_provincial_tax_brackets(year, province):
    manitoba_rate_2024 = {
        10.8: int(47000),
        12.75: int(53000),
        17.4: int(-1)
    }
    return manitoba_rate_2024

# Method to get federal tax rate for the specified year
# TODO: Make this call soon to be built tax brackets API to get data
def get_federal_tax_brackets(year):
    tax_rate_2024 = {
        15: int(55867),
        20.5: int(55866),
        26: int(61472),
        29: int(73547),
        33: int(-1)
    }
    return tax_rate_2024