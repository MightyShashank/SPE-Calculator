import React, { useState, useEffect } from 'react';

// Main App Component
export default function App() {
    // State management for the calculator
    const [input, setInput] = useState('0'); // Current input display
    const [expression, setExpression] = useState(''); // The full mathematical expression
    const [isRadians, setIsRadians] = useState(true); // Mode for trigonometric functions (Radians/Degrees)
    const [memory, setMemory] = useState(0); // Memory store
    const [showSecondFunctions, setShowSecondFunctions] = useState(false); // Toggle for 2nd functions
    const [isLoading, setIsLoading] = useState(false); // Loading state for backend call

    // Load math.js library from CDN for backend simulation
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.min.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // --- MOCK BACKEND FUNCTION ---
    // In a real application, this function would make a fetch request to your server.
    const evaluateOnBackend = async (expr) => {
        setIsLoading(true);
        setInput('Calculating...');

        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // ** REPLACE THIS BLOCK WITH YOUR ACTUAL BACKEND API CALL **
            // For example:
            // const response = await fetch('https://your-backend.com/calculate', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ expression: expr })
            // });
            // const data = await response.json();
            // if (!response.ok) throw new Error(data.error || 'Calculation failed');
            // return data.result;
            
            // --- Start of Mock Backend Logic (using math.js for demonstration) ---
            if (window.math) {
                const mathWithConfig = window.math.create(window.math.all, {
                    predictable: true,
                    number: 'BigNumber'
                });
                let evalExpression = expr.replace(/√/g, 'sqrt').replace(/π/g, 'pi');
                evalExpression = evalExpression.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
                evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => `factorial(${num})`);

                if (!isRadians) {
                    evalExpression = evalExpression.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, func, angle) => `${func}(${angle} deg)`);
                }
                
                const result = mathWithConfig.evaluate(evalExpression, {});
                const formattedResult = mathWithConfig.format(result, { notation: 'fixed', precision: 10 });
                const finalResult = String(parseFloat(formattedResult));
                return finalResult;
            } else {
                throw new Error('math.js not loaded');
            }
            // --- End of Mock Backend Logic ---

        } catch (error) {
            console.error("Backend Error:", error);
            throw new Error('Invalid Expression'); // This error will be caught below
        } finally {
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
                break;
            case 'C': // Clear current input
                setInput('0');
                break;
            case '←': // Backspace
                setInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                break;
            case '=': // Evaluate expression on the backend
                if (expression) {
                    try {
                        const result = await evaluateOnBackend(expression);
                        setInput(result);
                        setExpression(result);
                    } catch (error) {
                        setInput('Error');
                        setExpression('');
                    }
                }
                break;
            case 'Rad':
            case 'Deg':
                setIsRadians(!isRadians);
                break;
            case '+/-':
                setInput(prev => (parseFloat(prev) * -1).toString());
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
            case 'x²':
                setExpression(prev => `(${prev})^2`);
                await handleButtonClick('=');
                break;
            case 'x³':
                setExpression(prev => `(${prev})^3`);
                await handleButtonClick('=');
                break;
             case 'xʸ':
                setInput(prev => prev + '^');
                setExpression(prev => prev + '^');
                break;
            case 'eˣ':
                setExpression(prev => `exp(${expression})`);
                await handleButtonClick('=');
                break;
            case '10ˣ':
                setExpression(prev => `10^(${expression})`);
                await handleButtonClick('=');
                break;
            case '¹/x':
                setExpression(prev => `1/(${expression})`);
                await handleButtonClick('=');
                break;
            case '²√x':
                setExpression(prev => `sqrt(${expression})`);
                await handleButtonClick('=');
                break;
            case '³√x':
                 setExpression(prev => `cbrt(${expression})`);
                 await handleButtonClick('=');
                 break;
            case 'ʸ√x':
                setInput(prev => prev + ' nthRoot ');
                setExpression(prev => prev + ' nthRoot ');
                break;
            case 'ln':
                setExpression(prev => `log(${expression})`);
                await handleButtonClick('=');
                break;
            case 'log₁₀':
                setExpression(prev => `log10(${expression})`);
                await handleButtonClick('=');
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'sinh':
            case 'cosh':
            case 'tanh':
                 setExpression(prev => `${value}(${prev})`);
                 await handleButtonClick('=');
                 break;
            case 'sin⁻¹':
                 setExpression(prev => `asin(${prev})`);
                 await handleButtonClick('=');
                 break;
            case 'cos⁻¹':
                setExpression(prev => `acos(${prev})`);
                await handleButtonClick('=');
                break;
            case 'tan⁻¹':
                setExpression(prev => `atan(${prev})`);
                await handleButtonClick('=');
                break;
            case 'e':
                 setInput('2.71828');
                 setExpression(prev => prev + '2.71828');
                 break;
            case 'EE':
                 setInput(prev => prev + 'e');
                 setExpression(prev => prev + 'e');
                 break;
            case 'π':
                setInput('3.14159');
                setExpression(prev => prev + 'pi');
                break;
            case 'rand':
                 setInput(Math.random().toString());
                 setExpression(Math.random().toString());
                 break;
            case '!':
                setExpression(prev => `${prev}!`);
                await handleButtonClick('=');
                break;
            default: // Handles numbers, operators, and parenthesis
                if (input === '0' && value !== '.') {
                    setInput(value);
                    setExpression(value);
                } else if (input === 'Error') {
                    setInput(value);
                    setExpression(value);
                } else {
                    setInput(prev => prev + value);
                    setExpression(prev => prev + value);
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
        { val: showSecondFunctions ? 'ʸ√x' : '²√x', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'sin⁻¹' : 'sin', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'cos⁻¹' : 'cos', className: 'bg-gray-700 hover:bg-gray-600' },
        { val: showSecondFunctions ? 'tan⁻¹' : 'tan', className: 'bg-gray-700 hover:bg-gray-600' },

        { val: showSecondFunctions ? 'xʸ' : '¹/x', className: 'bg-gray-700 hover:bg-gray-600' },
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
                        if (btn.val.includes('²')) {
                            displayVal = <span>x<sup>2</sup></span>;
                        } else if (btn.val.includes('³')) {
                            displayVal = <span>x<sup>3</sup></span>;
                        } else if (btn.val.includes('ʸ')) {
                            displayVal = <span>x<sup>y</sup></span>;
                        } else if (btn.val.includes('¹/x')) {
                            displayVal = <span><sup>1</sup>/<sub>x</sub></span>;
                        } else if (btn.val.includes('²√x')) {
                            displayVal = <span><sup>2</sup>√x</span>;
                        } else if (btn.val.includes('³√x')) {
                            displayVal = <span><sup>3</sup>√x</span>;
                        } else if (btn.val.includes('ʸ√x')) {
                            displayVal = <span><sup>y</sup>√x</span>;
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

