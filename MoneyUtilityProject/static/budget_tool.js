
let monthlyExpenseDict = {};
let monthlyExpenses = 0;

let savingsGoalsDict = {};
let savingsGoals = 0;

let incomeDict = {};
let preTaxIncomeTotal = 0;
let postTaxIncomeTotal = 0; 
let currentIncomeRequest = "";

/*
Function to submit the calculator form data to backend
*/
function SubmitAddExpense(event) {
    event.preventDefault(); // Prevent form from redirecting

    let expenseLabel = $("#expenseLabel").val();
    let expenseCost = $("#expenseCost").val();
    let expenseFrequency = $("#expenseFrequency").val();

    // Expense already exists
    if (expenseLabel in monthlyExpenseDict) {
        alert("The expense " + expenseLabel + " is a duplicate and cannot be added.");
        return;
    }

    // Convert cost to monthly cost
    if (expenseFrequency != 12) {
        expenseCost = (expenseCost * expenseFrequency) / 12;
    }

    // Track expense data
    monthlyExpenseDict[expenseLabel] = expenseCost;

    DisplayExpense(expenseLabel, expenseCost);
    UpdateExpenseTotal(expenseCost);
    UpdateRequiredIncomesPostTax();

    ClearExpenseInput();
}

/*
Function to submit the calculator form data to backend
*/
function SubmitAddSavingsGoal(event) {
    event.preventDefault(); // Prevent form from redirecting

    let savingsLabel = $("#savingsGoalLabel").val();
    let savingsCost = $("#savingsAmount").val();
    let savingsFrequency = $("#savingsFrequency").val();

    // Savings goal already exists
    if (savingsLabel in monthlyExpenseDict) {
        alert("The savings goal " + savingsLabel + " is a duplicate and cannot be added.");
        return;
    }

    // Convert savings to yearly savings
    if (savingsFrequency != 1) {
        savingsCost = (savingsCost * savingsFrequency);
    }

    // Track savings goals data
    savingsGoalsDict[savingsLabel] = savingsCost;

    DisplaySavingsGoals(savingsLabel, savingsCost);
    UpdateSavingsGoalsTotal(savingsCost);
    UpdateRequiredIncomesPostTax();

    ClearSavingsGoalsInput();
}

/*
Function to submit the calculator form data to backend
*/
function SubmitAddIncome(event) {
    event.preventDefault(); // Prevent form from redirecting

    let incomeLabel = $("#incomeLabel").val();
    let incomeAmount = $("#incomeAmount").val();
    let incomeFrequency = $("#numPayments").val();
    let incomeYear = $("#incomeYear").val();
    let province = $("#incomeProvince").val();

    // Income already exists
    if (incomeLabel in incomeDict) {
        alert("The income " + incomeLabel + " is a duplicate and cannot be added.");
        return;
    }

    // Convert income to monthly income
    if (incomeFrequency != 12) {
        incomeAmount = (incomeAmount * incomeFrequency) / 12;
    }

    currentIncomeRequest = incomeLabel;
    RequestPostTaxIncomeCalculation(incomeAmount, incomeYear, province, 12)
}

/*
Hides the button to calculate required income the first time
Shows the container for the required income
Updates required incomes
*/
function ButtonClickCalculateRequiredIncome(event) {
    event.preventDefault();

    HideElement("bttnCalculateRequiredIncome");
    ShowElement("bttnReCalculateRequiredIncome");
    ShowElement("requiredIncomeContainer");

    ButtonClickReCalculateRequiredIncome(event);
}

/*
Updates required incomes
*/
function ButtonClickReCalculateRequiredIncome(event) {
    event.preventDefault();

    let year = $("#requiredIncomeYear").val();
    let province = $("#requiredIncomeProvince").val();

    //UpdateRequiredIncomesPreTax();

    //RequestPreTaxIncomeCalculation((monthlyExpenses * 12), year, province, "Expenses");
    //RequestPreTaxIncomeCalculation(((monthlyExpenses * 12) + savingsGoals), year, province, "ExpensesAndGoals");
}

/*
Sends POST request to server to calculate post tax income
*/
function RequestPostTaxIncomeCalculation(preTaxIncome, year, province, numPayments) {
    $.ajax({
        type: "POST",
        url: "/income_calculator/calculate_income/",
        data: {
            "income": preTaxIncome,
            "year": year,
            "province": province,
            "numPayments": numPayments
        },
        success: function (data) {
            SuccessPostTaxIncomeCalculation(JSON.parse(data));
        }
    });
}

///*
//Sends POST request to server to calculate pre tax incomes
//*/
//function RequestPreTaxIncomeCalculation(preTaxIncome, year, province, identifier) {
//    $.ajax({
//        type: "POST",
//        url: "/income_calculator/calculate_pre_tax_income/",
//        data: {
//            "income": preTaxIncome,
//            "year": year,
//            "province": province,
//        },
//        success: function (data) {
//            SuccessPostTaxIncomeCalculation(JSON.parse(data, identifier));
//        }
//    });
//}

/*
Calculate post tax income request was a success. Perform the actions required when the operation is successful.
- Clear income inputs
- Track income data
- Display added income in html
*/
function SuccessPostTaxIncomeCalculation(data) {
    ClearIncomeInput();

    // Track income data
    incomeDict[currentIncomeRequest] = data;
    let preTaxIncomeMonthly = data["pre_tax_income_other_forms"]["payments_12"];
    let postTaxIncomeMonthly = data["post_tax_income_other_forms"]["payments_12"];

    DisplayIncome(currentIncomeRequest, preTaxIncomeMonthly, postTaxIncomeMonthly, data["tax_year"], data["province"]);
    UpdateIncomeTotal(preTaxIncomeMonthly, postTaxIncomeMonthly);
}

///*
//Calculate pre tax income request was a success. Perform the actions required when the operation is successful.
//- Update the required incomes pre-tax
//*/
//function SuccessPreTaxIncomeCalculation(data, identifier) {
//    UpdateRequiredIncomesPreTax(preTaxIncome, identifier);
//}

/*
Hides other forms and displays monthly expense form
*/
function DisplayMonthlyExpenseForm() {
    HideElement("savingsGoalsFormContainer");
    HideElement("incomeFormContainer");
    ShowElement("expenseFormContainer");
}

/*
Hides other forms and displays savings goals from
*/
function DisplaySavingsGoalsForm() {
    HideElement("expenseFormContainer");
    HideElement("incomeFormContainer");
    ShowElement("savingsGoalsFormContainer");
}

/*
Hides other forms and displays savings goals from
*/
function DisplayIncomeForm() {
    HideElement("expenseFormContainer");
    HideElement("savingsGoalsFormContainer");
    ShowElement("incomeFormContainer");
}



/*
Creates and populates html to display expense
*/
function DisplayExpense(label, cost) {
    let templateElement = document.getElementById("monthlyExpenseTemplate");
    let newElement = templateElement.cloneNode(true);

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    newElement.id = "";

    let tdChildren = newElement.getElementsByTagName("td");

    tdChildren["label"].innerHTML = label;
    tdChildren["cost"].innerHTML = formatter.format(cost);

    templateElement.insertAdjacentElement("afterend", newElement);

    // Ensure expenses are displayed
    ShowElement("monthlyExpenseContainer");
}

/*
Creates and populates html to display savings goals
*/
function DisplaySavingsGoals(label, cost) {
    let templateElement = document.getElementById("monthlySavingsGoalsTemplate");
    let newElement = templateElement.cloneNode(true);

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    newElement.id = "";

    let tdChildren = newElement.getElementsByTagName("td");

    tdChildren["label"].innerHTML = label;
    tdChildren["cost"].innerHTML = formatter.format(cost);

    templateElement.insertAdjacentElement("afterend", newElement);

    // Ensure savings goals are displayed
    ShowElement("monthlySavingsGoalsContainer");
}


/*
Creates and populates html to display income
*/
function DisplayIncome(label, preTaxAmount, postTaxAmount, year, province) {
    let templateElement = document.getElementById("incomeTemplate");
    let newElement = templateElement.cloneNode(true);

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    newElement.id = "";

    let tdChildren = newElement.getElementsByTagName("td");

    tdChildren["label"].innerHTML = label;
    tdChildren["preTaxIncome"].innerHTML = formatter.format(preTaxAmount);
    tdChildren["postTaxIncome"].innerHTML = formatter.format(postTaxAmount);
    tdChildren["year"].innerHTML = year;
    tdChildren["province"].innerHTML = province;

    templateElement.insertAdjacentElement("afterend", newElement);

    // Ensure income is displayed
    ShowElement("incomeContainer");
}

/*
Updates the monthly expense total
*/
function UpdateExpenseTotal(expense) {
    monthlyExpenses += Number(expense);
    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });
    document.getElementById("expenseTotal").innerHTML = formatter.format(monthlyExpenses);

    UpdateSummaryTotals();
}

/*
Updates the savings goals total
*/
function UpdateSavingsGoalsTotal(savingsAmount) {
    savingsGoals += Number(savingsAmount);
    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });
    document.getElementById("savingsTotal").innerHTML = formatter.format(savingsGoals);

    UpdateSummaryTotals();
}

/*
Updates the income totals
*/
function UpdateIncomeTotal(preTaxIncome, postTaxIncome) {
    preTaxIncomeTotal += Number(preTaxIncome);
    postTaxIncomeTotal += Number(postTaxIncome);

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });
    document.getElementById("preTaxIncomeTotal").innerHTML = formatter.format(preTaxIncomeTotal);
    document.getElementById("postTaxIncomeTotal").innerHTML = formatter.format(postTaxIncomeTotal);

    UpdateSummaryTotals();
}


/*
Update the summary numbers
*/
function UpdateSummaryTotals() {
    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    // Monthly income
    let summaryIncomeElement = document.getElementById("summaryMonthlyIncome");
    summaryIncomeElement.innerHTML = formatter.format(postTaxIncomeTotal);

    // Monthly expenses
    let summaryExpensesElement = document.getElementById("summaryMonthlyExpenses");
    summaryExpensesElement.innerHTML = formatter.format(monthlyExpenses);

    // Yearly disposable income
    let summaryDisplosableIncomeEle = document.getElementById("summaryYearlyDisplosableIncome");
    let summaryPlannedDisplosableIncomeEle = document.getElementById("summaryPlannedYearlyDisplosableIncome");

    summaryDisplosableIncomeEle.innerHTML = formatter.format((postTaxIncomeTotal - monthlyExpenses) * 12);
    summaryPlannedDisplosableIncomeEle.innerHTML = formatter.format(savingsGoals); 
}

/*
Updates the post-tax income required for expenses / goals
*/
function UpdateRequiredIncomesPostTax() {
    ShowElement("requiredIncomeContainer");

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    let reqYearlyIncomeExpEle = document.getElementById("requiredIncomeExpensesYearlyPostTax");
    let reqMonthlyIncomeExpEle = document.getElementById("requiredIncomeExpensesMonthlyPostTax");
    reqYearlyIncomeExpEle.innerHTML = formatter.format(monthlyExpenses * 12) + "/Year";
    reqMonthlyIncomeExpEle.innerHTML = formatter.format(monthlyExpenses) + "/Month";

    let reqYearlyIncomeExpAndGoalsEle = document.getElementById("requiredIncomeExpensesAndGoalsYearlyPostTax");
    let reqMonthlyIncomeExpAndGoalsEle = document.getElementById("requiredIncomeExpensesAndGoalsMonthlyPostTax");
    reqYearlyIncomeExpAndGoalsEle.innerHTML = formatter.format((monthlyExpenses * 12) + savingsGoals) + "/Year";
    reqMonthlyIncomeExpAndGoalsEle.innerHTML = formatter.format(monthlyExpenses + (savingsGoals / 12)) + "/Month";
}

///*
//Updates the pre-tax income required for the section corresponding to identifier
//*/
//function UpdateRequiredIncomesPreTax(yearlyPreTaxIncome, identifier) {
//    let reqYearlyIncomeExpEle = document.getElementById("requiredIncome" + identifier + "YearlyPreTax");
//    let reqMonthlyIncomeExpEle = document.getElementById("requiredIncome" + identifier + "MonthlyPreTax");
//    reqYearlyIncomeExpEle.innerHTML = formatter.format(yearlyPreTaxIncome) + "/Year";
//    reqMonthlyIncomeExpEle.innerHTML = formatter.format(yearlyPreTaxIncome / 12) + "/Month";
//}

/*
Clears the expense form inputs
*/
function ClearExpenseInput() {
    $("#expenseLabel").val("");
    $("#expenseCost").val("");
}

/*
Clears the savings goals form inputs
*/
function ClearSavingsGoalsInput() {
    $("#savingsGoalLabel").val("");
    $("#savingsAmount").val("");
}

/*
Clears the savings goals form inputs
*/
function ClearIncomeInput() {
    $("#incomeLabel").val("");
    $("#incomeAmount").val("");
}

/*
Removes hiddent-content class from element matching ID 
*/
function ShowElement(elementID) {
    document.getElementById(elementID).classList.remove("hidden-content");
}

/*
Adds hiddent-content class from element matching ID 
*/
function HideElement(elementID) {
    document.getElementById(elementID).classList.add("hidden-content");
}