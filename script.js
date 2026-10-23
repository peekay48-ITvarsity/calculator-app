
const screen = document.getElementById("screen");
const previous = document.getElementById("previous");

let current = "0";
let stored = null;
let operator = null;
let waitingForNumber = false;
let finished = false;

function updateDisplay() {
    screen.value = current;
    previous.textContent =
        stored !== null && operator
            ? `${stored} ${operatorSymbol(operator)}`
            : "";
}

function operatorSymbol(op) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷" }[op];
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number(number.toPrecision(12)));
}

function clearCalculator() {
    current = "0";
    stored = null;
    operator = null;
    waitingForNumber = false;
    finished = false;
    updateDisplay();
}

function inputNumber(number) {
    if (current === "Error" || waitingForNumber || finished) {
        current = number;
        waitingForNumber = false;
        finished = false;
    } else if (current === "0") {
        current = number;
    } else if (current.replace("-", "").length < 15) {
        current += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (current === "Error" || waitingForNumber || finished) {
        current = "0.";
        waitingForNumber = false;
        finished = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateDisplay();
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function chooseOperator(nextOperator) {
    if (current === "Error") return;

    const value = Number(current);

    if (operator && !waitingForNumber) {
        const result = calculate(stored, value, operator);
        current = formatNumber(result);

        if (current === "Error") {
            stored = null;
            operator = null;
            updateDisplay();
            return;
        }

        stored = Number(current);
    } else {
        stored = value;
    }

    operator = nextOperator;
    waitingForNumber = true;
    finished = false;
    updateDisplay();
}

function equals() {
    if (operator === null || stored === null || current === "Error") {
        return;
    }

    const result = calculate(stored, Number(current), operator);
    previous.textContent =
        `${stored} ${operatorSymbol(operator)} ${current} =`;

    current = formatNumber(result);
    stored = null;
    operator = null;
    waitingForNumber = true;
    finished = true;
    updateDisplay();

    if (current === "Error") {
        previous.textContent = "Cannot divide by zero";
    }
}

function deleteDigit() {
    if (current === "Error" || finished || waitingForNumber) {
        current = "0";
        finished = false;
        waitingForNumber = false;
    } else {
        current = current.length > 1
            ? current.slice(0, -1)
            : "0";

        if (current === "-") current = "0";
    }

    updateDisplay();
}

function percentage() {
    if (current === "Error") return;

    current = formatNumber(Number(current) / 100);
    waitingForNumber = true;
    finished = false;
    updateDisplay();
}

function toggleSign() {
    if (current === "Error" || current === "0") return;

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    finished = false;
    updateDisplay();
}

document.querySelector(".buttons").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;
        case "delete":
            deleteDigit();
            break;
        case "decimal":
            inputDecimal();
            break;
        case "percent":
            percentage();
            break;
        case "sign":
            toggleSign();
            break;
        case "equals":
            equals();
            break;
    }
});

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) inputNumber(key);
    else if (key === ".") inputDecimal();
    else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
    else if (key === "Enter" || key === "=") equals();
    else if (key === "Backspace") deleteDigit();
    else if (key === "Escape") clearCalculator();
    else return;

    event.preventDefault();
});

updateDisplay();
