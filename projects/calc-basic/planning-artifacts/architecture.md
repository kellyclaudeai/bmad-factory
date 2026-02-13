# Technical Architecture: calc-basic

## Architecture Pattern
Component-Based State Machine - vanilla JavaScript with DOM view layer

## State Machine
```javascript
{
  currentValue: string,      // Display value
  previousValue: string,     // Previous operand
  operation: string|null,    // Current operation: '+', '-', '*', '/'
  waitingForOperand: boolean // Operation state flag
}
```

## Core Methods
- `inputDigit(digit)` - Handle 0-9 input
- `inputDecimal()` - Handle decimal point (prevent duplicates)
- `performOperation(op)` - Execute current operation, set next
- `calculate()` - Compute result
- `clear()` - Reset state
- `updateDisplay()` - Render to DOM

## Implementation Notes
- Event delegation on button grid
- Pure JavaScript (ES6+), no frameworks
- CSS Grid for layout
- Division by zero → display "Error"
- Number overflow → exponential notation
- Display truncates at 12 characters
