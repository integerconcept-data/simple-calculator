"# simple-calculator" 
# Calculator

A fully functional, keyboard-supported calculator built with vanilla HTML, CSS, and JavaScript. It performs all basic math operations and handles chained calculations with a clean, modern interface.

---

## ✨ Features

- **Basic Operations:** Addition, subtraction, multiplication, and division.
- **Chained Calculations:** Evaluates one pair of numbers at a time (e.g., `12 + 7 - 1 =` computes `12 + 7 = 19`, then `19 - 1 = 18`).
- **Clear & Backspace:** Wipe all data with `C`, or undo the last input with `⌫`.
- **Decimal Support:** Use the `.` button to enter floating-point numbers (only one decimal point per number is allowed).
- **Divide-by-Zero Guard:** Displays a snarky error message instead of crashing.
- **Consecutive Operator Handling:** Pressing an operator twice does not trigger an evaluation — it simply updates the pending operator.
- **Fresh Start After Result:** Pressing a digit after a result clears the result and begins a new calculation.
- **Full Keyboard Support:** Use your keyboard for faster input (see shortcuts below).
- **Rounded Results:** Long decimals are rounded to prevent display overflow.

---

## 🚀 Getting Started

1. **Clone or download** the repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).
3. That's it — no build tools, dependencies, or installation required.

```bash
# Optional: clone via git
git clone <your-repo-url>
cd calculator
open index.html   # macOS
# or
start index.html  # Windows