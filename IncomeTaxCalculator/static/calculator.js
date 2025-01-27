
/*
Function to submit the calculator form data to backend
*/
function calculatorSubmit(){
    event.preventDefault(); // Prevent form from redirecting

    // Retrieve form values
    const income = document.getElementById('income').value;
    const year = document.getElementById('year').value;
    const province = document.getElementById('province').value;
    const numPayments = document.getElementById('numPayments').value;

    let data = {
        "income": income,
        "year": year,
        "province": province,
        "numPayments": numPayments
    };

    $.ajax({
           type: "POST",
           url: "calculate_income/",
           data:  $("#calculatorForm").serialize(), // serializes the form's elements.
           success: function(data)
           {
                displayCalculatorResults(JSON.parse(data));
           }
         });
}

/*
Function to update the page element with the results of the calculation
*/
function displayCalculatorResults(data) {
    let templateElement = document.getElementById("calculatorResultTemplate");
    let newElement = templateElement.cloneNode(true);

    newElement.classList.remove("hidden-content");

    let pChildren = newElement.getElementsByTagName("P");
    pChildren["postTaxIncomeYearly"].insertAdjacentHTML("afterbegin", data["post_tax_income_yearly"]);
    pChildren["postTaxIncomeBiWeekly"].insertAdjacentHTML("afterbegin", data["post_tax_income_26"]);
    pChildren["postTaxIncomeWeekly"].insertAdjacentHTML("afterbegin", data["post_tax_income_52"]);
    pChildren["postTaxIncome40Hours"].insertAdjacentHTML("afterbegin", data["post_tax_income_2080"]);
    pChildren["postTaxIncome37.5Hours"].insertAdjacentHTML("afterbegin", data["post_tax_income_1950"]);
    pChildren["postTaxIncome35Hours"].insertAdjacentHTML("afterbegin", data["post_tax_income_1820"]);

    pChildren["provincialTax"].innerHTML = data["provincial_tax"];
    pChildren["federalTax"].innerHTML = data["federal_tax"];

    templateElement.insertAdjacentElement("afterend", newElement);
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
