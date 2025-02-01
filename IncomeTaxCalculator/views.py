# Create your views here.
import html
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

other_common_income_payments = [12, 26, 52, 2080, 1950, 1820]

# Views to return templates
def calculator_page(request):
    template = loader.get_template('page_calculator.html')
    return HttpResponse(template.render())

# Entry method to calculate income requests
@csrf_exempt
def request_calculate_income(request):
    input_income = request.POST.get('income', 0)
    input_year = request.POST.get('year', 0)
    input_province = request.POST.get('province', 0)
    input_payments = request.POST.get('numPayments', 0)

    clean_input = sanitize_calculator_input(input_income, input_year, input_province, input_payments)
    income = clean_input["income"]
    tax_year = clean_input["tax_year"]
    province = clean_input["province"]
    num_payments = clean_input["num_payments"]

    results = calculate_post_tax_income(income, tax_year, province, num_payments)
    return HttpResponse(json.dumps(results))

# Entry method to generate income ranges requests
@csrf_exempt
def request_generate_income_ranges(request):
    input_income_start = request.POST.get('income_starting', 0)
    input_income_end = request.POST.get('income_ending', 0)
    input_increment = request.POST.get('increment', 0)
    input_year = request.POST.get('year', 0)
    input_province = request.POST.get('province', 0)
    input_payments = request.POST.get('numPayments', 0)

    clean_input = sanitize_income_ranges_generator_input(input_income_start, input_income_end, input_increment, input_year, input_province)
    income_start = clean_input["income_start"]
    income_end = clean_input["income_end"]
    increment = clean_input["increment"]
    tax_year = clean_input["tax_year"]
    province = clean_input["province"]

    results = generate_income_ranges(income_start, income_end, increment, tax_year, province)
    return HttpResponse(json.dumps(results))


# Calculates the post-tax income 
def calculate_post_tax_income(income, tax_year, province, num_payments):

    pre_tax_income = income * num_payments

    provincial_tax = calculate_provincial_tax(pre_tax_income, tax_year, province)
    federal_tax = calculate_federal_tax(pre_tax_income, tax_year)

    post_tax_income = pre_tax_income - provincial_tax - federal_tax

    other_income_forms_pre_tax = get_income_in_other_forms(pre_tax_income, other_common_income_payments)
    other_income_forms_post_tax = get_income_in_other_forms(post_tax_income, other_common_income_payments)

    results = {
        "pre_tax_income_yearly": pre_tax_income,
        "post_tax_income_yearly": post_tax_income,
        "tax_year": tax_year,
        "province": province,
        "provincial_tax": provincial_tax,
        "federal_tax": federal_tax,
        "pre_tax_income_other_forms": other_income_forms_pre_tax,
        "post_tax_income_other_forms": other_income_forms_post_tax
    }

    return results

# Generates a range of post-tax incomes
def generate_income_ranges(income_start, income_end, increment, tax_year, province):
    results = []

    for income in range(income_start, income_end+1, increment):
        results.append(calculate_post_tax_income(income, tax_year, province, 1))

    return results


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
        key = f"payments_{num_payment}"
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

# Cleaner methods
def sanitize_calculator_input(input_income, input_year, input_province, input_payments):
    income = int(html.escape(str(input_income)))
    tax_year = int(html.escape(str(input_year)))
    province = html.escape(str(input_province))
    num_payments = int(html.escape(str(input_payments)))

    return {"income": income, "tax_year": tax_year, "province": province, "num_payments": num_payments}

def sanitize_income_ranges_generator_input(input_income_start, input_income_end, input_increment, input_year, input_province):
    income_start = int(html.escape(str(input_income_start)))
    income_end = int(html.escape(str(input_income_end)))
    increment = int(html.escape(str(input_increment)))
    tax_year = int(html.escape(str(input_year)))
    province = html.escape(str(input_province))

    return {
        "income_start": income_start, 
        "income_end": income_end, 
        "increment": increment,
        "tax_year": tax_year, 
        "province": province
    }