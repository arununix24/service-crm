# Personal Expense and Budget Tracker

A responsive web-based application for tracking your personal expenses and budget.

## Features

- **Transaction Management:** Add, edit, and delete income and expense transactions
- **Budget Tracking:** Set monthly budgets and visualize your spending against them
- **EMI Management:** Track fixed monthly EMI payments with start and end dates
- **Multiple Currency Support:** Choose from USD, EUR, GBP, JPY, INR, CAD, AUD, and CNY
- **Visual Analytics:** View your spending patterns with dynamic charts
- **Data Persistence:** All data is stored locally in your browser
- **Responsive Design:** Works on all devices from mobile to desktop
- **Dark/Light Mode:** Switch between dark and light themes based on preference
- **Filtering:** Filter transactions by category, date range, or transaction type
- **Recurring Transactions:** Mark transactions as recurring for better tracking

## How to Use

### Getting Started

1. Simply open the `index.html` file in any modern web browser (Chrome, Firefox, Safari, Edge, etc.)
2. No installation or internet connection required after initial load
3. Select your preferred currency from the dropdown menu in the header

### Setting a Budget

1. Enter your monthly budget amount in the "Monthly Budget" section
2. Click "Set" to save your budget
3. The budget progress bar will show how much of your budget you've used

### Managing EMIs

1. Fill out the form in the "Monthly EMIs" section:
   - EMI Name: Name of the loan or payment (e.g., "Car Loan")
   - Monthly Amount: The fixed amount paid each month
   - Start Date: When the EMI payments begin
   - End Date: When the EMI payments will end (optional)
2. Click "Add EMI" to save it
3. EMIs are automatically included in your expense calculations and budget tracking

### Adding Transactions

1. Fill out the form in the "Add Transaction" section:
   - Amount: The transaction amount (numeric value)
   - Category: Select from the predefined categories
   - Date: Date of the transaction
   - Description: Brief description of the transaction
   - Type: Select whether it's an income or expense
   - Recurring: Check this box if it's a recurring transaction
2. Click "Add Transaction" to save it

### Managing Transactions

- **View**: All your transactions appear in the Transaction History section
- **Edit**: Click the edit icon next to any transaction to modify it
- **Delete**: Click the delete icon next to any transaction to remove it
- **Filter**: Use the filter options to view transactions by category, date range, or type

### Using Theme Toggle

- Click the moon/sun icon in the top-right corner to switch between dark and light modes

### Changing Currency

- Select your preferred currency from the dropdown menu in the header
- All amounts in the application will automatically update to the selected currency

## Data Storage

All your data is stored locally in your browser's localStorage. This means:

- Your data persists even if you close the browser and return later
- No data is sent to any server (your financial data stays on your device)
- Clearing your browser data will delete your stored transactions and preferences

## Technical Details

- Built with pure HTML, CSS, and JavaScript (no frameworks)
- Uses Chart.js for data visualization
- FontAwesome for icons
- Responsive design with CSS Grid and Flexbox
- CSS custom properties for theming

## Browsers Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Any modern browser with localStorage and ES6 support 