# Create your views here.
import html
import json
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

other_common_income_payments = [12, 26, 52, 2080, 1950, 1820]
const_federal_tax_brackets = {
    2025: {
        15: int(57375),
        20.5: int(57375),
        26: int(63132),
        29: int(75532),
        33: int(-1)
    }
}
const_provincial_tax_brackets = {
    2025: {
        "AB": {
            10: int(151234),
            12: int(30247),
            13: int(60493),
            14: int(120987),
            15: int(-1)
        },
        "BC": {
            5.06: int(49279),
            7.7: int(49281),
            10.5: int(14598),
            12.29: int(24249),
            14.7: int(48899),
            16.8: int(73523),
            20.5: int(-1)
        },
        "MB": {
            10.8: int(47564),
            12.75: int(53636),
            17.4: int(-1)
        },
        "NB": {
            9.4: int(51306),
            14: int(51308),
            16: int(87446),
            19.5: int(-1)
        },
        "NL": {
            8.7: int(44192),
            14.5: int(44910),
            15.8: int(69410),
            17.8: int(63118),
            19.8: int(61304),
            20.8: int(282215),
            21.3: int(564429),
            21.8: int(-1),
        },
        "NT": {
            5.9: int(51964),
            8.6: int(51966),
            12.2: int(65037),
            14.05: int(-1)
        },
        "NS": {
            8.79: int(30507),
            14.95: int(30508),
            16.67: int(34868),
            17.5: int(58767),
            21: int(-1)
        },
        "NU": {
            4: int(54707),
            7: int(54706),
            9: int(68468),
            11.5: int(-1)
        },
        "ON": {
            5.05: int(52886),
            9.15: int(52889),
            11.16: int(44225),
            12.16: int(70000),
            13.16: int(-1)
        },
        "PE": {
            9.5: int(33328),
            13.47: int(31328),
            16.6: int(40344),
            17.62: int(35000),
            19: int(-1)
        },
        "QC": {
            14: int(53255),
            19: int(53240),
            24: int(23095),
            25.75: int(-1)
        },
        "SK": {
            10.5: int(53463),
            12.5: int(99287),
            14.5: int(-1)

        },
        "YT": {
            6.4: int(57375),
            9: int(57375),
            10.9: int(63132),
            12.8: int(322118),
            15: int(-1)
        }
    }
}

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
    return const_provincial_tax_brackets[year][province]

# Method to get federal tax rate for the specified year
# TODO: Make this call soon to be built tax brackets API to get data
def get_federal_tax_brackets(year):
    return const_federal_tax_brackets[year]

# Cleaner methods
def sanitize_calculator_input(input_income, input_year, input_province, input_payments):
    income = int(float(html.escape(str(input_income))))
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