import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
// IMPORTANT: This path assumes your test file and your calculator component (scientific-calculator.jsx) are both inside the 'src' folder.
import App from './App.jsx'; 

describe('Scientific Calculator Tests', () => {
    beforeEach(() => {
        // Reset the fetch mock so that tests don't interfere with each other
        fetch.resetMocks();
    });

    it('should render the calculator with an initial display of 0', () => {
        render(<App />);
        // Target only the main display which has the larger text class
        const inputDisplay = screen.getByText('0', { selector: '.text-4xl' });
        expect(inputDisplay).toBeInTheDocument();
    });

    it('should display multi-digit numbers correctly', async () => {
        render(<App />);
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('5'));
        fireEvent.click(screen.getByText('9'));
        
        // Find the text specifically in the main, larger display
        const inputDisplay = await screen.findByText('159', { selector: '.text-4xl' });
        expect(inputDisplay).toBeInTheDocument();
    });

    it('should handle addition and show the correct result from the mocked backend', async () => {
        // Mock the backend call for this specific test
        fetch.mockResponseOnce(JSON.stringify({ result: '12' }));

        render(<App />);
        fireEvent.click(screen.getByText('8'));
        fireEvent.click(screen.getByText('+'));
        fireEvent.click(screen.getByText('4'));
        fireEvent.click(screen.getByText('='));
        
        // Check that our mock backend was called correctly
        expect(fetch).toHaveBeenCalledWith('http://localhost:4000/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: '8+4', isRadians: true })
        });
        
        // Wait for the UI to update and find the result in the main display
        await waitFor(() => {
            expect(screen.getByText('12', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should handle a scientific function (x²) correctly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ result: '81' }));

        render(<App />);
        fireEvent.click(screen.getByText('9'));
        fireEvent.click(screen.getByRole('button', { name: /x2/i })); // Find button with accessible name "x2"
        
        // Check that the expression is built correctly in the main display first
        const expressionDisplay = await screen.findByText('(9)^2', { selector: '.text-4xl' });
        expect(expressionDisplay).toBeInTheDocument();

        fireEvent.click(screen.getByText('='));

        // After calculating, check for the final result in the main display
        await waitFor(() => {
            expect(screen.getByText('81', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should handle factorial (x!) correctly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ result: '120' }));
    
        render(<App />);
        fireEvent.click(screen.getByText('5'));
        fireEvent.click(screen.getByText('!'));
        
        const expressionDisplay = await screen.findByText('5!', { selector: '.text-4xl' });
        expect(expressionDisplay).toBeInTheDocument();

        fireEvent.click(screen.getByText('='));
    
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:4000/calculate', expect.anything());
            expect(screen.getByText('120', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should handle power (xʸ) correctly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ result: '8' }));
    
        render(<App />);
        // Use a more specific query to find the button with the exact name "2"
        fireEvent.click(screen.getByRole('button', { name: /^2$/ }));
        fireEvent.click(screen.getByRole('button', { name: /xy/i }));
        fireEvent.click(screen.getByText('3'));
        
        const expressionDisplay = await screen.findByText('2^3', { selector: '.text-4xl' });
        expect(expressionDisplay).toBeInTheDocument();

        fireEvent.click(screen.getByText('='));
    
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:4000/calculate', expect.anything());
            expect(screen.getByText('8', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should handle natural log (ln) correctly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ result: '0' }));
    
        render(<App />);
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('ln'));
        
        const expressionDisplay = await screen.findByText('log(1)', { selector: '.text-4xl' });
        expect(expressionDisplay).toBeInTheDocument();

        fireEvent.click(screen.getByText('='));
    
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:4000/calculate', expect.anything());
            expect(screen.getByText('0', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should handle square root (²√x) correctly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ result: '4' }));
    
        render(<App />);
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('6'));
        fireEvent.click(screen.getByRole('button', { name: /2√x/i }));
        
        const expressionDisplay = await screen.findByText('sqrt(16)', { selector: '.text-4xl' });
        expect(expressionDisplay).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('='));
    
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:4000/calculate', expect.anything());
            expect(screen.getByText('4', { selector: '.text-4xl' })).toBeInTheDocument();
        });
    });

    it('should display "Error" if the backend returns an error', async () => {
        // Mock a failed backend response
        fetch.mockResponseOnce(JSON.stringify({ error: 'Invalid Expression' }), { status: 400 });

        render(<App />);
        fireEvent.click(screen.getByText('5'));
        fireEvent.click(screen.getByText('/'));
        fireEvent.click(screen.getByText('0'));
        fireEvent.click(screen.getByText('='));
        
        // "Error" will only appear in the main display, so this test is fine as is
        await waitFor(() => {
            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });
});

