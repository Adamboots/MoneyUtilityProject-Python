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
    print(f"Provincial tax on  ${income} is ${provincial_tax}")

    final_income = income - provincial_tax
    result = {
        "post_tax_income": final_income,
        "provincial_tax": provincial_tax
    }

    print(f"Result: {result}")
    return HttpResponse(json.dumps(result))

# Calculates and returns provincial tax on the provided income
def calculate_provincial_tax(income, year, province):
    remainder = income
    tax_brackets = get_provincial_tax_brackets(year, province)
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


    # while remainder > 0:
    #     income_to_tax = remainder
    #     if income_to_tax > tax_bracket

# Method to get provincial tax rate for the specified year
# TODO: Make this call soon to be built tax brackets API to get data
def get_provincial_tax_brackets(year, province):
    tax_rate_2024 = {
        10.8: int(47000),
        12.75: int(53000),
        17.4: int(-1)
    }
    return tax_rate_2024