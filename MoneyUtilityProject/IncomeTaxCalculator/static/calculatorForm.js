
/*
Function to submit the calculator form data to backend
*/
function calculatorSubmit(){
    event.preventDefault(); // Prevent form from redirecting

    // Retrieve form values
    const income = document.getElementById('income').value;
    const year = document.getElementById('year').value;
    const province = document.getElementById('province').value;
    const cpp = document.getElementById('cpp').checked;

    let data = {
        "income": income,
        "year": year,
        "province": province,
        "cpp": cpp
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
function displayCalculatorResults(data){
    document.getElementById("postTaxIncome").innerHTML = data["post_tax_income"];
    document.getElementById("provincialTax").innerHTML = data["provincial_tax"];
    document.getElementById("federalTax").innerHTML = data["federal_tax"];
}