
let monthlyExpenseDict = {};

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

    ClearExpenseInput();
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
    RemoveHiddenClass("monthlyExpenseContainer");
}

/*
Removes hiddent-content class from element matching ID 
*/
function RemoveHiddenClass(elementID) {
    document.getElementById(elementID).classList.remove("hidden-content");
}

/*
Clears the expense form inputs
*/
function ClearExpenseInput() {
    $("#expenseLabel").val("");
    $("#expenseCost").val("");
}
