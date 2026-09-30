// ---------- CALCULATOR STATE ----------
    // firstNumber, operator, secondNumber as strings for building
    let firstNumber = '';
    let operator = '';
    let secondNumber = '';
    // when true, the next digit should start a new number (used after operator or equals)
    let waitingForSecondNumber = false;
    // when true, the display shows a result and next digit should reset everything
    let resultDisplayed = false;

    // DOM elements
    const displaySpan = document.getElementById('display');
    const clearBtn = document.getElementById('clear');
    const backspaceBtn = document.getElementById('backspace');
    const equalsBtn = document.getElementById('equals');
    const digitButtons = document.querySelectorAll('.digit');
    const operatorButtons = document.querySelectorAll('.operator[data-op]');

    // ---------- BASIC MATH FUNCTIONS (and test in console) ----------
    function add(a, b) {
      return a + b;
    }
    function subtract(a, b) {
      return a - b;
    }
    function multiply(a, b) {
      return a * b;
    }
    function divide(a, b) {
      if (b === 0) {
        return 'ERROR: Division by zero is not allowed. 🚫';
      }
      return a / b;
    }

    // ---------- OPERATE FUNCTION ----------
    function operate(op, num1, num2) {
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      if (isNaN(a) || isNaN(b)) return 'Error'; // should not happen if guarded
      switch (op) {
        case '+': return add(a, b);
        case '-': return subtract(a, b);
        case '*': return multiply(a, b);
        case '/': return divide(a, b);
        default: return 'Error';
      }
    }

    // ---------- HELPER: update display from current state ----------
    function updateDisplay(value) {
      // value is string or number; if number, round to avoid overflow
      let displayText = value;
      if (typeof value === 'number') {
        // round long decimals
        if (!Number.isInteger(value) && value.toString().includes('.')) {
          // round to 10 decimal places, then remove trailing zeros
          displayText = parseFloat(value.toFixed(10)).toString();
        } else {
          displayText = value.toString();
        }
      }
      // if error message, show as is
      if (typeof displayText === 'string' && displayText.startsWith('ERROR')) {
        displaySpan.textContent = displayText;
        return;
      }
      // limit length? we'll let it be, but if too long, we can slice, but we round.
      displaySpan.textContent = displayText;
    }

    // ---------- DIGIT HANDLER ----------
    function handleDigit(digit) {
      // if display shows an error, reset everything first
      if (displaySpan.textContent.startsWith('ERROR')) {
        clearAll();
      }

      // if a result was displayed, start fresh with this digit
      if (resultDisplayed) {
        // reset state
        firstNumber = '';
        operator = '';
        secondNumber = '';
        waitingForSecondNumber = false;
        resultDisplayed = false;
        // start new number
        if (digit === '.') {
          firstNumber = '0.';
        } else {
          firstNumber = digit;
        }
        updateDisplay(firstNumber);
        return;
      }

      // if waiting for second number, we start building secondNumber
      if (waitingForSecondNumber) {
        // if digit is '.', start with "0."
        if (digit === '.') {
          secondNumber = '0.';
        } else {
          secondNumber = digit;
        }
        waitingForSecondNumber = false;
        updateDisplay(secondNumber);
        return;
      }

      // determine which number we are appending to
      if (operator === '') {
        // building first number
        if (digit === '.') {
          // only add decimal if not already present
          if (firstNumber.includes('.')) return;
          if (firstNumber === '') {
            firstNumber = '0.';
          } else {
            firstNumber += '.';
          }
        } else {
          // avoid leading zeros (except "0" itself)
          if (firstNumber === '0' && digit !== '.') {
            firstNumber = digit; // replace '0'
          } else {
            firstNumber += digit;
          }
        }
        updateDisplay(firstNumber);
      } else {
        // building second number
        if (digit === '.') {
          if (secondNumber.includes('.')) return;
          if (secondNumber === '') {
            secondNumber = '0.';
          } else {
            secondNumber += '.';
          }
        } else {
          if (secondNumber === '0' && digit !== '.') {
            secondNumber = digit;
          } else {
            secondNumber += digit;
          }
        }
        updateDisplay(secondNumber);
      }
    }

    // ---------- OPERATOR HANDLER ----------
    function handleOperator(op) {
      // if error, reset first
      if (displaySpan.textContent.startsWith('ERROR')) {
        clearAll();
      }

      // if just pressed an operator and no second number yet, update operator (consecutive operators)
      if (waitingForSecondNumber && operator !== '') {
        // replace operator
        operator = op;
        // keep waiting
        return;
      }

      // if we have a result displayed, we use that as firstNumber and start new operation
      if (resultDisplayed) {
        // take the displayed result as firstNumber
        firstNumber = displaySpan.textContent;
        // if result is error, reset
        if (firstNumber.startsWith('ERROR')) {
          clearAll();
          return;
        }
        operator = op;
        secondNumber = '';
        waitingForSecondNumber = true;
        resultDisplayed = false;
        return;
      }

      // if we have firstNumber but no operator yet, set operator
      if (firstNumber !== '' && operator === '') {
        operator = op;
        waitingForSecondNumber = true;
        return;
      }

      // if we have firstNumber, operator, and secondNumber already (user typed second number)
      if (firstNumber !== '' && operator !== '' && secondNumber !== '') {
        // evaluate first pair
        const result = operate(operator, firstNumber, secondNumber);
        // if error, display and reset (but keep error)
        if (typeof result === 'string' && result.startsWith('ERROR')) {
          updateDisplay(result);
          // reset everything except we want to show error, but next digit will clear
          firstNumber = '';
          operator = '';
          secondNumber = '';
          waitingForSecondNumber = false;
          resultDisplayed = true; // treat as result so next digit resets
          return;
        }
        // round if needed
        let roundedResult = result;
        if (typeof result === 'number' && !Number.isInteger(result) && result.toString().includes('.')) {
          roundedResult = parseFloat(result.toFixed(10));
        }
        updateDisplay(roundedResult);
        // set firstNumber to the result, operator to new op, clear secondNumber
        firstNumber = roundedResult.toString();
        operator = op;
        secondNumber = '';
        waitingForSecondNumber = true;
        resultDisplayed = false; // we are in the middle of a chain
        return;
      }

      // if we have firstNumber but no secondNumber (e.g., after equals? handled) or just operator repeated
      if (firstNumber !== '' && operator !== '' && secondNumber === '') {
        // just update operator
        operator = op;
        waitingForSecondNumber = true;
      }
    }

    // ---------- EQUALS HANDLER ----------
    function handleEquals() {
      // if error, reset
      if (displaySpan.textContent.startsWith('ERROR')) {
        clearAll();
        return;
      }

      // if we don't have both numbers and operator, do nothing (or maybe show first number?)
      if (firstNumber === '' || operator === '' || secondNumber === '') {
        // if we have a result already displayed, pressing equals does nothing (or repeats last op? we skip)
        return;
      }

      // evaluate
      const result = operate(operator, firstNumber, secondNumber);
      if (typeof result === 'string' && result.startsWith('ERROR')) {
        updateDisplay(result);
        // reset state but keep error message
        firstNumber = '';
        operator = '';
        secondNumber = '';
        waitingForSecondNumber = false;
        resultDisplayed = true;
        return;
      }

      // round result
      let roundedResult = result;
      if (typeof result === 'number' && !Number.isInteger(result) && result.toString().includes('.')) {
        roundedResult = parseFloat(result.toFixed(10));
      }
      updateDisplay(roundedResult);
      // set state: result becomes firstNumber, clear operator and secondNumber, resultDisplayed = true
      firstNumber = roundedResult.toString();
      operator = '';
      secondNumber = '';
      waitingForSecondNumber = false;
      resultDisplayed = true;
    }

    // ---------- CLEAR FUNCTION ----------
    function clearAll() {
      firstNumber = '';
      operator = '';
      secondNumber = '';
      waitingForSecondNumber = false;
      resultDisplayed = false;
      updateDisplay('0');
    }

    // ---------- BACKSPACE ----------
    function handleBackspace() {
      // if error or result displayed, clear all (or reset)
      if (displaySpan.textContent.startsWith('ERROR') || resultDisplayed) {
        clearAll();
        return;
      }

      // determine which number we are editing
      if (operator === '') {
        // editing firstNumber
        if (firstNumber.length > 0) {
          firstNumber = firstNumber.slice(0, -1);
          if (firstNumber === '') firstNumber = '';
          updateDisplay(firstNumber === '' ? '0' : firstNumber);
        } else {
          updateDisplay('0');
        }
      } else {
        // editing secondNumber
        if (secondNumber.length > 0) {
          secondNumber = secondNumber.slice(0, -1);
          updateDisplay(secondNumber === '' ? '0' : secondNumber);
        } else {
          // if secondNumber empty, maybe delete operator? we'll keep operator and show 0
          updateDisplay('0');
        }
      }
    }

    // ---------- EVENT LISTENERS ----------
    digitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const digit = btn.dataset.digit;
        handleDigit(digit);
      });
    });

    operatorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const op = btn.dataset.op;
        handleOperator(op);
      });
    });

    equalsBtn.addEventListener('click', handleEquals);
    clearBtn.addEventListener('click', clearAll);
    backspaceBtn.addEventListener('click', handleBackspace);

    // ---------- KEYBOARD SUPPORT ----------
    window.addEventListener('keydown', (e) => {
      const key = e.key;
      // digits 0-9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      }
      // decimal point
      else if (key === '.') {
        e.preventDefault();
        handleDigit('.');
      }
      // operators
      else if (key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (key === '*') {
        e.preventDefault();
        handleOperator('*');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('/');
      }
      // equals
      else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        handleEquals();
      }
      // backspace
      else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
      // clear (Escape or 'c')
      else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
    });

    // initial display
    updateDisplay('0');

    // quick test of math functions in console (as requested)
    console.log('add 3+5 =', add(3, 5));
    console.log('subtract 10-4 =', subtract(10, 4));
    console.log('multiply 6*7 =', multiply(6, 7));
    console.log('divide 8/2 =', divide(8, 2));
    console.log('divide 5/0 =', divide(5, 0)); // error message
    console.log('operate + 12,7 =', operate('+', '12', '7'));
  