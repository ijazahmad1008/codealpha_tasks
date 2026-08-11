class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.waitingForNewValue = false;
    }

    appendNumber(number) {
        if (this.waitingForNewValue) {
            this.currentOperand = number.toString();
            this.waitingForNewValue = false;
            return;
        }

        // Limit the number of digits to 12 to prevent screen overflow
        const digitCount = this.currentOperand.replace('.', '').replace('-', '').length;
        if (digitCount >= 12) return;

        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.operation !== undefined && !this.waitingForNewValue) {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.waitingForNewValue = true;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case 'x':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.waitingForNewValue = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.waitingForNewValue = true;
    }

    percent() {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        this.currentOperand = (current / 100).toString();
        this.waitingForNewValue = true;
    }

    toggleSign() {
        if (this.currentOperand === 'Error' || this.currentOperand === '0') return;
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.substring(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    updateDisplay() {
        if (this.currentOperand === 'Error') {
            this.currentOperandElement.innerText = 'Error';
            this.previousOperandElement.innerText = '';
            return;
        }

        let num = parseFloat(this.currentOperand);
        let displayStr = '';

        if (isNaN(num)) {
            displayStr = '0';
        } else {
            // Handle very large numbers or long decimals to fit the screen limit
            let stringNum = this.currentOperand.toString();
            let isNegative = stringNum.startsWith('-');
            let checkNum = isNegative ? stringNum.substring(1) : stringNum;
            let integerPart = checkNum.split('.')[0];
            
            if (integerPart.length > 12 || checkNum.length > 15) {
                displayStr = num.toExponential(5);
            } else {
                let integerDigits = parseFloat(isNegative ? "-" + integerPart : integerPart);
                let decimalDigits = checkNum.split('.')[1];
                
                let integerDisplay;
                if (isNaN(integerDigits)) {
                    integerDisplay = '0';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
                }

                if (decimalDigits != null) {
                    displayStr = `${integerDisplay}.${decimalDigits}`;
                } else {
                    displayStr = integerDisplay;
                }
            }
        }

        this.currentOperandElement.innerText = displayStr;
        
        // Font size scaling logic
        let len = displayStr.length;
        if (len > 12) {
            this.currentOperandElement.style.fontSize = '2.2rem';
        } else if (len > 9) {
            this.currentOperandElement.style.fontSize = '2.8rem';
        } else if (len > 6) {
            this.currentOperandElement.style.fontSize = '3.5rem';
        } else {
            this.currentOperandElement.style.fontSize = '5.5rem';
        }

        if (this.operation != null) {
            let prevNum = parseFloat(this.previousOperand);
            let prevDisplay = isNaN(prevNum) ? '' : prevNum.toLocaleString('en', { maximumFractionDigits: 9 });
            if (prevNum.toString().length > 9) {
                prevDisplay = prevNum.toExponential(5);
            }
            this.previousOperandElement.innerText = `${prevDisplay}${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.querySelector('[data-previous-operand]');
    const currentOperandElement = document.querySelector('[data-current-operand]');
    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // Number Buttons
    const numButtons = document.querySelectorAll('.num');
    numButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.dataset.number);
            calculator.updateDisplay();
        });
    });

    // Operation Buttons
    const opButtons = document.querySelectorAll('.btn-orange:not([data-action="calculate"])');
    opButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    });

    // Equal Button
    document.querySelector('[data-action="calculate"]').addEventListener('click', () => {
        calculator.compute();
        calculator.updateDisplay();
    });

    // Clear Button
    document.querySelector('[data-action="clear"]').addEventListener('click', () => {
        calculator.clear();
        calculator.updateDisplay();
    });

    // Toggle Sign Button
    document.querySelector('[data-action="toggle-sign"]').addEventListener('click', () => {
        calculator.toggleSign();
        calculator.updateDisplay();
    });

    // Percent Button
    document.querySelector('[data-action="percent"]').addEventListener('click', () => {
        calculator.percent();
        calculator.updateDisplay();
    });

    // Keyboard Support
    document.addEventListener('keydown', e => {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            calculator.appendNumber(e.key);
            calculator.updateDisplay();
        }
        
        if (e.key === '+' || e.key === '-') {
            calculator.chooseOperation(e.key);
            calculator.updateDisplay();
        }
        
        if (e.key === '*' || e.key === '/') {
            e.preventDefault();
            calculator.chooseOperation(e.key === '*' ? 'x' : '/');
            calculator.updateDisplay();
        }
        
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculator.compute();
            calculator.updateDisplay();
        }
        
        if (e.key === 'Backspace') {
            if (calculator.currentOperand.length === 1 || (calculator.currentOperand.length === 2 && calculator.currentOperand.startsWith('-'))) {
                calculator.currentOperand = '0';
            } else {
                calculator.currentOperand = calculator.currentOperand.slice(0, -1);
            }
            calculator.updateDisplay();
        }
        
        if (e.key === 'Escape') {
            calculator.clear();
            calculator.updateDisplay();
        }

        if (e.key === '%') {
            calculator.percent();
            calculator.updateDisplay();
        }
    });
    
    calculator.clear();
    calculator.updateDisplay();
});
