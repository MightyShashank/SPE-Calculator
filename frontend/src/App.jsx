import React, { useState } from 'react';

// Main App Component
export default function App() {
    // State management for the calculator
    const [input, setInput] = useState('0'); // Current input display
    const [expression, setExpression] = useState(''); // The full mathematical expression
    const [isRadians, setIsRadians] = useState(true); // Mode for trigonometric functions (Radians/Degrees)
    const [memory, setMemory] = useState(0); // Memory store
    const [showSecondFunctions, setShowSecondFunctions] = useState(false); // Toggle for 2nd functions
    const [isLoading, setIsLoading] = useState(false); // Loading state for backend call
    const [isResult, setIsResult] = useState(false); // Tracks if the current input is a result

    // --- BACKEND API FUNCTION ---
    // This function makes a real fetch request to your backend server.
    const evaluateOnBackend = async (expr) => {
        setIsLoading(true);
        setInput('Calculating...');

        try {
            // Make a POST request to the backend's /calculate endpoint
            const response = await fetch('http://localhost:4000/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // Send the expression and the current angle mode (Rad/Deg)
              body: JSON.stringify({ expression: expr, isRadians: isRadians })
            });
            
            const data = await response.json();

            // If the server responded with an error status, throw an error.
            if (!response.ok) {
                throw new Error(data.error || 'Calculation failed');
            }

            // Return the result from the backend.
            return data.result;

        } catch (error) {
            console.error("Backend Error:", error);
            // This error will be caught by the calling function.
            throw new Error('Invalid Expression');
        } finally {
            // Ensure loading is set to false whether the call succeeds or fails.
            setIsLoading(false);
        }
    };
    
    // Handles button clicks and updates state
    const handleButtonClick = async (value) => {
        if (isLoading) return; // Prevent clicks while calculating

        switch (value) {
            case 'AC': // All Clear
                setInput('0');
                setExpression('');
                setIsResult(false);
                break;
            case 'C': // Clear current input. If input is already 0, clear the whole expression.
                if (input === '0') {
                    setExpression('');
                }
                setInput('0');
                break;
            case '←': // Backspace
                setInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                setExpression(prev => prev.length > 1 ? prev.slice(0, -1) : '');
                break;
            case '=': // Evaluate expression on the backend
                if (expression) {
                    try {
                        const result = await evaluateOnBackend(expression);
                        setInput(result);
                        setExpression(result);
                        setIsResult(true);
                    } catch (error) {
                        setInput('Error');
                        setExpression('');
                        setIsResult(false);
                    }
                }
                break;
            case 'Rad':
            case 'Deg':
                setIsRadians(!isRadians);
                break;
            case '+/-':
                setInput(prev => (prev.startsWith('-') ? prev.substring(1) : `-${prev}`));
                setExpression(prev => (prev.startsWith('-') ? prev.substring(1) : `-${prev}`));
                break;
            case 'M+':
                setMemory(prev => prev + parseFloat(input));
                break;
            case 'M-':
                setMemory(prev => prev - parseFloat(input));
                break;
            case 'MR':
                setInput(memory.toString());
                setExpression(prev => prev + memory.toString());
                break;
            case 'MC':
                setMemory(0);
                break;
            case '2nd':
                setShowSecondFunctions(!showSecondFunctions);
                break;
            // For complex functions, build the expression string.
            // The user will press '=' when they are ready to evaluate.
            case 'x²':
                setExpression(prev => `(${prev})^2`);
                setInput(prev => `(${prev})^2`);
                break;
            case 'x³':
                setExpression(prev => `(${prev})^3`);
                setInput(prev => `(${prev})^3`);
                break;
             case 'xʸ':
                setInput(prev => prev + '^');
                setExpression(prev => prev + '^');
                break;
            case 'eˣ':
                setExpression(prev => `exp(${prev})`);
                setInput(prev => `exp(${prev})`);
                break;
            case '10ˣ':
                setExpression(prev => `10^(${prev})`);
                setInput(prev => `10^(${prev})`);
                break;
            case '¹/x':
                setExpression(prev => `1/(${prev})`);
                setInput(prev => `1/(${prev})`);
                break;
            case '²√x':
                setExpression(prev => `sqrt(${prev})`);
                setInput(prev => `sqrt(${prev})`);
                break;
            case '³√x':
                 setExpression(prev => `cbrt(${prev})`);
                 setInput(prev => `cbrt(${prev})`);
                 break;
            case 'ʸ√x':
                setInput(prev => prev + ' nthRoot ');
                setExpression(prev => prev + ' nthRoot ');
                break;
            case 'ln':
                setExpression(prev => `log(${prev})`);
                setInput(prev => `log(${prev})`);
                break;
            case 'log₁₀':
                setExpression(prev => `log10(${prev})`);
                setInput(prev => `log10(${prev})`);
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'sinh':
            case 'cosh':
            case 'tanh':
                 setExpression(prev => `${value}(${prev})`);
                 setInput(prev => `${value}(${prev})`);
                 break;
            case 'sin⁻¹':
                 setExpression(prev => `asin(${prev})`);
                 setInput(prev => `asin(${prev})`);
                 break;
            case 'cos⁻¹':
                setExpression(prev => `acos(${prev})`);
                setInput(prev => `acos(${prev})`);
                break;
            case 'tan⁻¹':
                setExpression(prev => `atan(${prev})`);
                setInput(prev => `atan(${prev})`);
                break;
            case 'e':
                 setInput(prev => (prev === '0' || isResult) ? '2.71828' : prev + '2.71828');
                 setExpression(prev => (prev === '0' || isResult) ? '2.71828' : prev + '2.71828');
                 setIsResult(false);
                 break;
            case 'EE':
                 setInput(prev => prev + 'e');
                 setExpression(prev => prev + 'e');
                 break;
            case 'π':
                setInput(prev => (prev === '0' || isResult) ? '3.14159' : prev + '3.14159');
                setExpression(prev => (prev === '0' || isResult) ? 'pi' : prev + 'pi');
                setIsResult(false);
                break;
            case 'rand':
                 const randomNum = Math.random().toString();
                 setInput(randomNum);
                 setExpression(randomNum);
                 break;
            case '!':
                setExpression(prev => `${prev}!`);
                setInput(prev => `${prev}!`);
                break;
            default: // Handles numbers, operators, and parenthesis
                const isOperator = ['+', '-', '*', '/', '%', '^'].includes(value);

                if (isResult && !isOperator) { // A result is on screen, and user types a number
                    setInput(value);
                    setExpression(value);
                    setIsResult(false);
                } else { // All other cases: appending operator to result, or normal typing
                    if ((input === '0' && value !== '.') || input === 'Error') {
                        setInput(value);
                        setExpression(value);
                    } else {
                        setInput(prev => prev + value);
                        setExpression(prev => prev + value);
                    }
                    setIsResult(false);
                }
                break;
        }
    };

    // Reusable Button component
    const Button = ({ value, className = '', children }) => (
        <button
            onClick={() => handleButtonClick(value)}
            disabled={isLoading}
            className={`flex-1 p-2 m-1 text-xl sm:text-2xl font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        >
            {children || value}
        </button>
    );
    
    // Layout for calculator buttons
    const primaryButtons = [
        { val: showSecondFunctions ? 'x³' : 'x²', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? '³√x' : '²√x', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'sin⁻¹' : 'sin', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'cos⁻¹' : 'cos', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'tan⁻¹' : 'tan', className: 'bg-gray-700 hover:bg-gray-600' },

        { val: showSecondFunctions ? '¹/x' : 'xʸ', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: 'ln', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '(', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: ')', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '/', className: 'bg-orange-500 hover:bg-orange-600' },

        { val: showSecondFunctions ? 'eˣ' : '!', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '7', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '8', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '9', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '*', className: 'bg-orange-500 hover:bg-orange-600' },
        
        { val: showSecondFunctions ? '10ˣ' : '%', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '4', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '5', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '6', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '-', className: 'bg-orange-500 hover:bg-orange-600' },

        { val: 'π', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '1', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '2', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '3', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '+', className: 'bg-orange-500 hover:bg-orange-600' },

        { val: 'e', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '0', className: 'col-span-2 bg-gray-500 hover:bg-gray-400' },
        { val: '.', className: 'bg-gray-500 hover:bg-gray-400' },
        { val: '=', className: 'bg-orange-500 hover:bg-orange-600' },
    ];

    const secondaryButtons = [
        { val: 'AC', className: 'bg-red-500 hover:bg-red-600'},
        { val: '+/-', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '←', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: '2nd', className: showSecondFunctions ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'},
        { val: isRadians ? 'Rad' : 'Deg', className: 'bg-gray-700 hover:bg-gray-600'},

        { val: 'MC', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: 'M+', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: 'M-', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: 'MR', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: 'C', className: 'bg-gray-700 hover:bg-gray-600' },
    ];


    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 border border-gray-700">
                {/* Display */}
                <div className="bg-gray-900 text-white p-4 rounded-lg text-right overflow-x-auto">
                    <div className="text-gray-400 text-xl h-8 truncate">{expression || '0'}</div>
                    <div className="text-4xl sm:text-5xl font-bold h-14">{input}</div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-5 gap-2">
                    {secondaryButtons.map((btn) => (
                        <Button key={btn.val} value={btn.val} className={btn.className}>
                            {btn.val}
                        </Button>
                    ))}
                </div>
                 <div className="grid grid-cols-5 gap-2">
                    {primaryButtons.map((btn, index) => {
                         // Handling special rendering for x², x³, etc.
                        let displayVal = btn.val;
                        // Use specific checks first to avoid conflicts (e.g., '²√x' vs 'x²')
                        if (btn.val === '²√x') {
                            displayVal = <span><sup>2</sup>√x</span>;
                        } else if (btn.val === '³√x') {
                            displayVal = <span><sup>3</sup>√x</span>;
                        } else if (btn.val === 'ʸ√x') {
                            displayVal = <span><sup>y</sup>√x</span>;
                        } else if (btn.val === 'x²') {
                            displayVal = <span>x<sup>2</sup></span>;
                        } else if (btn.val === 'x³') {
                            displayVal = <span>x<sup>3</sup></span>;
                        } else if (btn.val === 'xʸ') {
                            displayVal = <span>x<sup>y</sup></span>;
                        } else if (btn.val === '¹/x') {
                            displayVal = <span><sup>1</sup>/<sub>x</sub></span>;
                        } else if (btn.val.includes('⁻¹')) {
                            displayVal = <span>{btn.val.split('⁻¹')[0]}<sup>-1</sup></span>;
                        } else if (btn.val.includes('₁₀')) {
                            displayVal = <span>log<sub>10</sub></span>;
                        } else if (btn.val.includes('ˣ')) {
                           const parts = btn.val.split('ˣ');
                           displayVal = <span>{parts[0]}<sup>x</sup></span>;
                        }
                        
                        return (
                             <Button key={index} value={btn.val} className={`${btn.className} ${btn.val === '0' ? 'col-span-2' : ''}`}>
                                {displayVal}
                             </Button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

