# Create your views here.
import html
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


def calculator_page(request):
    template = loader.get_template('calculator.html')
    return HttpResponse(template.render())

# Entry method to calculate income requests
@csrf_exempt
def calculate_income(request):
    input_income = request.POST.get('income', 0)
    input_year = request.POST.get('year', 0)
    input_payments = request.POST.get('numPayments', 0)
    input_province = request.POST.get('province', 0)

    province = html.escape(input_province)
    num_payments = int(html.escape(input_payments))
    tax_year = int(html.escape(input_year))
    income = int(html.escape(input_income)) * num_payments

    provincial_tax = calculate_provincial_tax(income, tax_year, province)
    federal_tax = calculate_federal_tax(income, tax_year)

    final_income = income - provincial_tax - federal_tax

    results = {
        "post_tax_income_yearly": final_income,
        "provincial_tax": provincial_tax,
        "federal_tax": federal_tax
    }

    other_common_income_payments = [26, 52, 2080, 1950, 1820]
    other_income_forms = get_income_in_other_forms(final_income, other_common_income_payments)
    results.update(other_income_forms)

    return HttpResponse(json.dumps(results))

# Calculates provincial tax
def calculate_provincial_tax(income, year, province):
    provincial_tax_brackets = get_provincial_tax_brackets(year, province)
    return calculate_tax(income, provincial_tax_brackets)

# Calculates federal tax
def calculate_federal_tax(income, year):
    federal_tax_brackets = get_federal_tax_brackets(year)
    return calculate_tax(income, federal_tax_brackets)

# Calculates and returns tax on the provided income with the provided tax brackets
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

# Converts the yearly income into other representations of the income corresponding to num_payments list
# Ex: Bi-weekly, weekly, 40hrs/week, 35hours/week
def get_income_in_other_forms(yearly_income, num_payments):
    result = {}
    for num_payment in num_payments:
        other_income_form = yearly_income / num_payment
        key = f"post_tax_income_{num_payment}"
        result[key] = other_income_form

    return result


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