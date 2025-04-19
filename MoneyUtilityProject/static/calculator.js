
/*
Function to submit the calculator form data to backend
*/
function calculatorSubmit(event) {
    event.preventDefault(); // Prevent form from redirecting
    $.ajax({
           type: "POST",
        url: "income_calculator/calculate_income/",
           data:  $("#calculatorForm").serialize(), // serializes the form's elements.
           success: function(data)
           {
                displayCalculatorResults(JSON.parse(data));
           }
         });
}

/*
Function to submit the generate income ranges form data to backend
*/
function incomeRangeGeneratorSubmit(event) {
    event.preventDefault(); // Prevent form from redirecting
    $.ajax({
        type: "POST",
        url: "income_calculator/generate_income_ranges/",
        data: $("#generateIncomeRangesForm").serialize(), // serializes the form's elements.
        success: function (data) {
            displayIncomeGeneratorResults(JSON.parse(data));
        }
    });
}

/*
Function to update the page elements with the results of the calculation
*/
function displayCalculatorResults(data) {
    let templateElement = document.getElementById("calculatorResultTemplate");
    let newElement = templateElement.cloneNode(true);

    newElement.classList.remove("hidden-content");
    newElement.id = "";

    let preTaxIncomeOtherForms = data["pre_tax_income_other_forms"];
    let postTaxIncomeOtherForms = data["post_tax_income_other_forms"];

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    let pChildren = newElement.getElementsByTagName("P");

    // Button for result
    pChildren["buttonPreTaxIncome"].innerHTML = formatter.format(data["pre_tax_income_yearly"]);
    pChildren["buttonProvince"].innerHTML = data["province"];
    pChildren["buttonTaxYear"].innerHTML = data["tax_year"];

    // Result elements
    pChildren["postTaxIncomeYearly"].insertAdjacentHTML("afterbegin", formatter.format(data["post_tax_income_yearly"]));
    pChildren["postTaxIncomeMonthly"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_12"]));
    pChildren["postTaxIncomeBiWeekly"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_26"]));
    pChildren["postTaxIncomeWeekly"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_52"]));
    pChildren["postTaxIncome40Hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_2080"]));
    pChildren["postTaxIncome37.5Hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_1950"]));
    pChildren["postTaxIncome35Hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_1820"]));

    pChildren["provincialTax"].innerHTML = formatter.format(data["provincial_tax"]);
    pChildren["federalTax"].innerHTML = formatter.format(data["federal_tax"]);

    templateElement.insertAdjacentElement("afterend", newElement);

    //SaveLocalStorage();
}

/*
Function to update the page elements with the results of the generator
*/
function displayIncomeGeneratorResults(data) {
    let hiddenResults = document.getElementById("incomeRangeGeneratorResultsHiddenContainer");
    let templateElementPreTax = document.getElementById("incomeRangeGeneratorResultsPreTaxTemplate");
    let templateElementPostTax = document.getElementById("incomeRangeGeneratorResultsPostTaxTemplate");

    hiddenResults.classList.remove("hidden-content");

    for (let i = 0; i < data.length; i++) {
        let newElementPreTax = templateElementPreTax.cloneNode(true);
        let newElementPostTax = templateElementPostTax.cloneNode(true);

        newElementPreTax.classList.remove("hidden-content");
        newElementPostTax.classList.remove("hidden-content");

        newElementPreTax.id = "";
        newElementPostTax.id = "";

        let currData = data[i];
        let preTaxIncomeOtherForms = currData["pre_tax_income_other_forms"];
        let postTaxIncomeOtherForms = currData["post_tax_income_other_forms"];

        let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

        let tdChildrenPreTax = newElementPreTax.getElementsByTagName("td");
        tdChildrenPreTax["preTaxIncomeYearly"].insertAdjacentHTML("afterbegin", formatter.format(currData["pre_tax_income_yearly"]));
        tdChildrenPreTax["preTaxIncomeMonthly"].insertAdjacentHTML("afterbegin", formatter.format(preTaxIncomeOtherForms["payments_12"]));
        tdChildrenPreTax["preTaxIncome40hours"].insertAdjacentHTML("afterbegin", formatter.format(preTaxIncomeOtherForms["payments_2080"]));
        tdChildrenPreTax["preTaxIncome37.5hours"].insertAdjacentHTML("afterbegin", formatter.format(preTaxIncomeOtherForms["payments_1950"]));
        tdChildrenPreTax["preTaxIncome35hours"].insertAdjacentHTML("afterbegin", formatter.format(preTaxIncomeOtherForms["payments_1820"]));

        let tdChildrenPostTax = newElementPostTax.getElementsByTagName("td");
        tdChildrenPostTax["postTaxIncomeYearly"].insertAdjacentHTML("afterbegin", formatter.format(currData["post_tax_income_yearly"]));
        tdChildrenPostTax["postTaxIncomeMonthly"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_12"]));
        tdChildrenPostTax["postTaxIncome40hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_2080"]));
        tdChildrenPostTax["postTaxIncome37.5hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_1950"]));
        tdChildrenPostTax["postTaxIncome35hours"].insertAdjacentHTML("afterbegin", formatter.format(postTaxIncomeOtherForms["payments_1820"]));

        //tdChildrenPostTax["taxYear"].innerHTML = currData["tax_year"];
        //tdChildrenPostTax["province"].innerHTML = currData["province"];

        templateElementPostTax.insertAdjacentElement("afterend", newElementPostTax);
        templateElementPostTax.insertAdjacentElement("afterend", newElementPreTax);
    }
}

function collapsibleContent(element) {

    // Toggle the class 'active'
    element.classList.toggle("active");
    var contentElement = element.nextElementSibling;


    // Flip between displaying and not displaying content
    if (contentElement.style.display === "block") {
        contentElement.style.display = "none";
    } else {
        contentElement.style.display = "block";
    }
}

//// Reads content of income calculator and saves data in localstorage for future use
//function SaveLocalStorage() {
//    let resultsSection = document.getElementById("incomeCalculatorResultsSection");
//}