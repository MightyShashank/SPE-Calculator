const express = require('express');
const { create, all } = require('mathjs');
const cors = require('cors');

const app = express();
// It's recommended to use a port from environment variables in production,
// but for this example, 3001 is fine.
const port = 4000;

// Configure a math.js instance with safe evaluation settings.
const math = create(all, {
  predictable: true,
  number: 'BigNumber'
});

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) to allow your frontend
// to make requests to this backend.
app.use(cors());
// Enable the Express app to parse JSON-formatted request bodies.
app.use(express.json());

// --- API Endpoint ---
// Define the /calculate endpoint that accepts POST requests.
app.post('/calculate', (req, res) => {
  // Extract the expression and isRadians flag from the request body.
  const { expression, isRadians } = req.body;

  // Basic validation to ensure an expression was sent.
  if (!expression) {
    return res.status(400).json({ error: 'Expression is required' });
  }

  try {
    // --- Expression Sanitization & Preparation ---
    // Replace user-friendly symbols with math.js functions.
    let evalExpression = expression
        .replace(/√/g, 'sqrt')
        .replace(/π/g, 'pi');
    
    // Handle percentage calculations.
    evalExpression = evalExpression.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    // Handle factorial calculations.
    evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => `factorial(${num})`);

    // If the calculator is in 'Degrees' mode, convert trig functions.
    if (isRadians === false) {
        evalExpression = evalExpression.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, func, angle) => `${func}(${angle} deg)`);
    }

    // --- Evaluation ---
    const result = math.evaluate(evalExpression);
    // Format the result to a fixed notation with a precision of 10 decimal places.
    const formattedResult = math.format(result, { notation: 'fixed', precision: 10 });
    
    // Convert to a string and parse back to a float to remove trailing zeros.
    const finalResult = String(parseFloat(formattedResult));

    // Send the successful result back to the frontend.
    res.json({ result: finalResult });

  } catch (error) {
    // If math.js throws an error (e.g., syntax error), catch it.
    console.error("Calculation Error:", error.message);
    // Respond with a 400 Bad Request status and a clear error message.
    res.status(400).json({ error: 'Invalid Expression' });
  }
});

// Start the server and listen for incoming connections.
app.listen(port, () => {
  console.log(`Calculator backend listening at http://localhost:${port}`);
});
