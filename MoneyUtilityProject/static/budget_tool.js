
const LOCAL_STORAGE_PARTAL_EXPENSE_KEY = "Monthly_Expenses";
const LOCAL_STORAGE_PARTAL_INCOME_KEY = "Yearly_Incomes";
const LOCAL_STORAGE_PARTAL_SAVINGS_KEY = "Yearly_Savings_Goals";
const LOCAL_STORAGE_KEY_SEPARATOR = "__";

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

    AddExpense(expenseLabel, expenseCost);
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

    AddSavingsGoal(savingsLabel, savingsCost);
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
Clears any data existing previously in local storage.
Then saves budget data to local storage.
*/
function ButtonClickSaveBudget() {
    ClearLocalStorageData();

    SaveLocalStorageData(LOCAL_STORAGE_PARTAL_EXPENSE_KEY, monthlyExpenseDict);
    SaveLocalStorageData(LOCAL_STORAGE_PARTAL_INCOME_KEY, incomeDict);
    SaveLocalStorageData(LOCAL_STORAGE_PARTAL_SAVINGS_KEY, savingsGoalsDict);
}

/*
Clears existing budget
Loads the local storage data and populate page with this data
*/
function ButtonClickLoadBudget() {
    ClearBudgetPage();
    let data = LoadLocalStorageData();

    // Load each expense
    for (key in data[LOCAL_STORAGE_PARTAL_EXPENSE_KEY]) {
        AddExpense(key, data[LOCAL_STORAGE_PARTAL_EXPENSE_KEY][key]) 
    }

    // Load each savings goal
    for (key in data[LOCAL_STORAGE_PARTAL_SAVINGS_KEY]) {
        AddSavingsGoal(key, data[LOCAL_STORAGE_PARTAL_SAVINGS_KEY][key])
    }

    // Load each income
    for (key in data[LOCAL_STORAGE_PARTAL_INCOME_KEY]) {
        currentIncomeRequest = key;
        SuccessPostTaxIncomeCalculation(data[LOCAL_STORAGE_PARTAL_INCOME_KEY][key]);
    }

}

/*
Loads and returns the local storage data
*/
function LoadLocalStorageData() {
    let data = {}
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        BuildDictionaryFromFlattenedDict(key, LOCAL_STORAGE_KEY_SEPARATOR, value, data);
    }
    return data;
}

/*
Loops through a dictionary and saves data to local storage
Provided prependKey is prepended with the current key of the dictionary
Will recursively loop through all dictionaries. 
(ie: Dictionary of dictionaries will result in multiple calls to this function)
*/
function SaveLocalStorageData(prependKey, dict) {
    for (dictKey in dict) {
        let value = dict[dictKey];
        if (value instanceof Object) {
            SaveLocalStorageData(prependKey + LOCAL_STORAGE_KEY_SEPARATOR + dictKey, value);
        }
        else {
            localStorage.setItem(prependKey + LOCAL_STORAGE_KEY_SEPARATOR + dictKey, value);
        }
    }
}

/*
Clears saved ata on local storage
*/
function ClearLocalStorageData() {
    localStorage.clear();
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

    CreateIncome(currentIncomeRequest, preTaxIncomeMonthly, postTaxIncomeMonthly, data["tax_year"], data["province"]);
    UpdateIncomeTotal(preTaxIncomeMonthly, postTaxIncomeMonthly);
}

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
Adds the expense label and expense cost to budget
*/
function AddExpense(expenseLabel, expenseCost) {

    // Track expense data
    monthlyExpenseDict[expenseLabel] = expenseCost;

    CreateExpense(expenseLabel, expenseCost);
    UpdateExpenseTotal(expenseCost);
    UpdateRequiredIncomesPostTax();

    ClearExpenseInput();
}

/*
Adds the savings goal label and savings goal cost to budget
*/
function AddSavingsGoal(savingsLabel, savingsCost) {

    // Track savings goals data
    savingsGoalsDict[savingsLabel] = savingsCost;

    CreateSavingsGoals(savingsLabel, savingsCost);
    UpdateSavingsGoalsTotal(savingsCost);
    UpdateRequiredIncomesPostTax();

    ClearSavingsGoalsInput();
}

/*
Creates and populates html to display expense
*/
function CreateExpense(label, cost) {
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
function CreateSavingsGoals(label, cost) {
    let templateElement = document.getElementById("yearlySavingsGoalsTemplate");
    let newElement = templateElement.cloneNode(true);

    let formatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'CAD' });

    newElement.id = "";

    let tdChildren = newElement.getElementsByTagName("td");

    tdChildren["label"].innerHTML = label;
    tdChildren["cost"].innerHTML = formatter.format(cost);

    templateElement.insertAdjacentElement("afterend", newElement);

    // Ensure savings goals are displayed
    ShowElement("yearlySavingsGoalsContainer");
}

/*
Creates and populates html to display income
*/
function CreateIncome(label, preTaxAmount, postTaxAmount, year, province) {
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

/*
Starts by clearing inputs on page
Then clears the parts of the page populated by submitting the forms
*/
function ClearBudgetPage() {
    // Clear inputs
    ClearExpenseInput();
    ClearIncomeInput();
    ClearSavingsGoalsInput();

    // Clear generated content
    ClearGeneratedContent("monthlyExpenseContainer");
    ClearGeneratedContent("incomeContainer");
    ClearGeneratedContent("yearlySavingsGoalsContainer");

    // Clear javascript data being stored
    ClearJavascriptData();
}

/*
Clears the javascript data for the income, expenses and savings goals
*/
function ClearJavascriptData() {
    monthlyExpenseDict = {};
    monthlyExpenses = 0;

    lsavingsGoalsDict = {};
    savingsGoals = 0;

    incomeDict = {};
    preTaxIncomeTotal = 0;
    postTaxIncomeTotal = 0;
}

/*
Clears the generated expenses content and hides elements
*/
function ClearGeneratedContent(containerID) {
    HideElement(containerID);
    let containerElements = document.getElementById(containerID).getElementsByTagName("tr");

    // Loop through only the generated contents
    for (let i = 2; i <= containerElements.length - 2; i++) {
        containerElements[i].remove();
    }
}

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

/*
Takes a key and uses the separator to build a dictionary which was previously flattened
*/
function BuildDictionaryFromFlattenedDict(key, separator, value, parentDict) {
    // Separate flattened key into the current key and remainder if possible
    let keySepIndex = key.indexOf(separator);
    let currentKey = key.substring(0, keySepIndex)

    // Did we reach the end of the flattened dictionary key?
    if (keySepIndex < 0) {
        parentDict[key] = value;
        return;
    }
    // The current key hasn't been added to dictionary yet
    else if (!(currentKey in parentDict)) {
        parentDict[currentKey] = {};
    }

    let remainderOfKey = key.substring(currentKey.length + separator.length, key.length);

    BuildDictionaryFromFlattenedDict(remainderOfKey, separator, value, parentDict[currentKey]);
}
