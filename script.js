// DOM elements
const transactionForm = document.getElementById('transaction-form');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const descriptionInput = document.getElementById('description');
const typeSelect = document.getElementById('type');
const recurringCheckbox = document.getElementById('recurring');
const transactionsContainer = document.getElementById('transactions-container');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const balanceElement = document.getElementById('balance');
const budgetAmountInput = document.getElementById('budget-amount');
const setBudgetButton = document.getElementById('set-budget');
const budgetDisplay = document.getElementById('budget-display');
const remainingBudget = document.getElementById('remaining-budget');
const budgetProgress = document.getElementById('budget-progress');
const toggleThemeButton = document.getElementById('toggle-theme');
const filterCategorySelect = document.getElementById('filter-category');
const filterDateStart = document.getElementById('filter-date-start');
const filterDateEnd = document.getElementById('filter-date-end');
const filterTypeSelect = document.getElementById('filter-type');
const applyFiltersButton = document.getElementById('apply-filters');
const clearFiltersButton = document.getElementById('clear-filters');
const addTransactionButton = document.getElementById('add-transaction');
const cancelEditButton = document.getElementById('cancel-edit');
const currencySelect = document.getElementById('currency-select');
const emiNameInput = document.getElementById('emi-name');
const emiAmountInput = document.getElementById('emi-amount');
const emiStartDateInput = document.getElementById('emi-start-date');
const emiEndDateInput = document.getElementById('emi-end-date');
const addEmiButton = document.getElementById('add-emi');
const emiContainer = document.getElementById('emi-container');
const totalEmisElement = document.getElementById('total-emis');

// State variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let emis = JSON.parse(localStorage.getItem('emis')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
let currentEditId = null;
let currentEditEmiId = null;
let chart = null;
let selectedCurrency = localStorage.getItem('currency') || 'USD';

// Currency settings
const currencies = {
    USD: { symbol: '$', position: 'before' },
    EUR: { symbol: '€', position: 'before' },
    GBP: { symbol: '£', position: 'before' },
    JPY: { symbol: '¥', position: 'before' },
    INR: { symbol: '₹', position: 'before' },
    CAD: { symbol: 'C$', position: 'before' },
    AUD: { symbol: 'A$', position: 'before' },
    CNY: { symbol: '¥', position: 'before' }
};

// Set today's date as default for date inputs
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;
emiStartDateInput.value = today;

// Initialize application
function init() {
    // Set initial currency
    currencySelect.value = selectedCurrency;
    
    updateBudgetDisplay();
    renderTransactions();
    renderEmis();
    updateSummary();
    renderChart();
    setThemeFromLocalStorage();
}

// Load saved theme from localStorage
function setThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        toggleThemeButton.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        toggleThemeButton.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Toggle between light and dark theme
toggleThemeButton.addEventListener('click', () => {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    
    if (isDarkTheme) {
        toggleThemeButton.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        toggleThemeButton.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
    
    renderChart(); // Re-render chart with updated theme colors
});

// Handle currency change
currencySelect.addEventListener('change', function() {
    selectedCurrency = this.value;
    localStorage.setItem('currency', selectedCurrency);
    
    // Update all UI elements with the new currency
    updateBudgetDisplay();
    renderTransactions();
    renderEmis();
    updateSummary();
});

// Format number as currency
function formatCurrency(amount) {
    const currency = currencies[selectedCurrency];
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    if (currency.position === 'before') {
        return currency.symbol + formattedAmount;
    } else {
        return formattedAmount + currency.symbol;
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date range
function formatDateRange(startDate, endDate) {
    if (!startDate) return '';
    
    const start = formatDate(startDate);
    
    if (!endDate) {
        return `From ${start}`;
    }
    
    const end = formatDate(endDate);
    return `${start} - ${end}`;
}

// Generate a unique ID
function generateID() {
    return Date.now().toString() + Math.random().toString().substring(2, 8);
}

// Add or update transaction
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value;
    const description = descriptionInput.value;
    const type = typeSelect.value;
    const recurring = recurringCheckbox.checked;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (currentEditId) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === currentEditId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                amount,
                category,
                date,
                description,
                type,
                recurring
            };
        }
        currentEditId = null;
        addTransactionButton.textContent = 'Add Transaction';
        cancelEditButton.style.display = 'none';
    } else {
        // Add new transaction
        const transaction = {
            id: generateID(),
            amount,
            category,
            date,
            description,
            type,
            recurring,
            createdAt: new Date().toISOString()
        };
        
        transactions.push(transaction);
    }
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    saveTransactions();
    
    // Reset form
    transactionForm.reset();
    dateInput.value = today;
    
    // Update UI
    renderTransactions();
    updateSummary();
    renderChart();
});

// Handle EMI form submission
addEmiButton.addEventListener('click', function() {
    const name = emiNameInput.value.trim();
    const amount = parseFloat(emiAmountInput.value);
    const startDate = emiStartDateInput.value;
    const endDate = emiEndDateInput.value || null;
    
    if (!name) {
        alert('Please enter an EMI name');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!startDate) {
        alert('Please select a start date');
        return;
    }
    
    if (currentEditEmiId) {
        // Update existing EMI
        const index = emis.findIndex(e => e.id === currentEditEmiId);
        if (index !== -1) {
            emis[index] = {
                ...emis[index],
                name,
                amount,
                startDate,
                endDate
            };
        }
        currentEditEmiId = null;
        addEmiButton.textContent = 'Add EMI';
    } else {
        // Add new EMI
        const emi = {
            id: generateID(),
            name,
            amount,
            startDate,
            endDate,
            createdAt: new Date().toISOString()
        };
        
        emis.push(emi);
    }
    
    // Save to localStorage
    saveEmis();
    
    // Reset form
    emiNameInput.value = '';
    emiAmountInput.value = '';
    emiStartDateInput.value = today;
    emiEndDateInput.value = '';
    
    // Update UI
    renderEmis();
    updateSummary();
});

// Cancel edit mode
cancelEditButton.addEventListener('click', function() {
    currentEditId = null;
    transactionForm.reset();
    dateInput.value = today;
    addTransactionButton.textContent = 'Add Transaction';
    cancelEditButton.style.display = 'none';
});

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Save EMIs to localStorage
function saveEmis() {
    localStorage.setItem('emis', JSON.stringify(emis));
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        renderTransactions();
        updateSummary();
        renderChart();
    }
}

// Delete EMI
function deleteEmi(id) {
    if (confirm('Are you sure you want to delete this EMI?')) {
        emis = emis.filter(emi => emi.id !== id);
        saveEmis();
        renderEmis();
        updateSummary();
    }
}

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(transaction => transaction.id === id);
    if (transaction) {
        amountInput.value = transaction.amount;
        categorySelect.value = transaction.category;
        dateInput.value = transaction.date;
        descriptionInput.value = transaction.description;
        typeSelect.value = transaction.type;
        recurringCheckbox.checked = transaction.recurring || false;
        
        currentEditId = id;
        addTransactionButton.textContent = 'Update Transaction';
        cancelEditButton.style.display = 'inline-block';
        
        // Scroll to form
        transactionForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Edit EMI
function editEmi(id) {
    const emi = emis.find(emi => emi.id === id);
    if (emi) {
        emiNameInput.value = emi.name;
        emiAmountInput.value = emi.amount;
        emiStartDateInput.value = emi.startDate;
        emiEndDateInput.value = emi.endDate || '';
        
        currentEditEmiId = id;
        addEmiButton.textContent = 'Update EMI';
        
        // Scroll to form
        emiNameInput.scrollIntoView({ behavior: 'smooth' });
    }
}

// Render transactions list
function renderTransactions() {
    // Apply filters if any
    const filteredTransactions = filterTransactions();
    
    // Clear transactions container
    transactionsContainer.innerHTML = '';
    
    if (filteredTransactions.length === 0) {
        transactionsContainer.innerHTML = '<div class="empty-state">No transactions found.</div>';
        return;
    }
    
    // Create transaction items
    filteredTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.classList.add('transaction-item');
        
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';
        const recurringIndicator = transaction.recurring ? '<i class="fas fa-sync-alt" title="Recurring"></i> ' : '';
        
        transactionItem.innerHTML = `
            <div class="transaction-date">${formatDate(transaction.date)}</div>
            <div class="transaction-details">
                <div>${recurringIndicator}${transaction.description}</div>
                <span class="transaction-category">${transaction.category}</span>
            </div>
            <div class="transaction-amount ${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</div>
            <div class="transaction-actions">
                <button class="action-btn edit-btn" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to edit and delete buttons
        transactionItem.querySelector('.edit-btn').addEventListener('click', () => {
            editTransaction(transaction.id);
        });
        
        transactionItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTransaction(transaction.id);
        });
        
        transactionsContainer.appendChild(transactionItem);
    });
}

// Render EMIs list
function renderEmis() {
    // Clear EMIs container
    emiContainer.innerHTML = '';
    
    if (emis.length === 0) {
        emiContainer.innerHTML = '<div class="empty-state">No EMIs added yet.</div>';
        return;
    }
    
    // Create EMI items
    emis.forEach(emi => {
        const emiItem = document.createElement('div');
        emiItem.classList.add('emi-item');
        
        emiItem.innerHTML = `
            <div class="emi-details">
                <h4>${emi.name}</h4>
                <small>${formatDateRange(emi.startDate, emi.endDate)}</small>
            </div>
            <div class="emi-amount">${formatCurrency(emi.amount)}</div>
            <div class="emi-actions">
                <button class="action-btn edit-emi-btn" data-id="${emi.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-emi-btn" data-id="${emi.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to edit and delete buttons
        emiItem.querySelector('.edit-emi-btn').addEventListener('click', () => {
            editEmi(emi.id);
        });
        
        emiItem.querySelector('.delete-emi-btn').addEventListener('click', () => {
            deleteEmi(emi.id);
        });
        
        emiContainer.appendChild(emiItem);
    });
    
    // Update total EMIs amount
    const totalEmis = emis.reduce((sum, emi) => sum + emi.amount, 0);
    totalEmisElement.textContent = formatCurrency(totalEmis);
}

// Filter transactions based on selected filters
function filterTransactions() {
    const categoryFilter = filterCategorySelect.value;
    const startDate = filterDateStart.value;
    const endDate = filterDateEnd.value;
    const typeFilter = filterTypeSelect.value;
    
    return transactions.filter(transaction => {
        // Filter by category
        const matchCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        
        // Filter by type
        const matchType = typeFilter === 'all' || transaction.type === typeFilter;
        
        // Filter by date range
        let matchDate = true;
        if (startDate && endDate) {
            matchDate = transaction.date >= startDate && transaction.date <= endDate;
        } else if (startDate) {
            matchDate = transaction.date >= startDate;
        } else if (endDate) {
            matchDate = transaction.date <= endDate;
        }
        
        return matchCategory && matchDate && matchType;
    });
}

// Apply filters
applyFiltersButton.addEventListener('click', () => {
    renderTransactions();
});

// Clear filters
clearFiltersButton.addEventListener('click', () => {
    filterCategorySelect.value = 'all';
    filterTypeSelect.value = 'all';
    filterDateStart.value = '';
    filterDateEnd.value = '';
    renderTransactions();
});

// Update summary (income, expenses, balance)
function updateSummary() {
    const totalIncome = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const totalExpenses = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Add EMIs to expenses
    const totalEmisAmount = emis.reduce((sum, emi) => sum + emi.amount, 0);
    const totalWithEmis = totalExpenses + totalEmisAmount;
    
    const balance = totalIncome - totalWithEmis;
    
    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalExpensesElement.textContent = formatCurrency(totalWithEmis);
    balanceElement.textContent = formatCurrency(balance);
    
    // Update remaining budget
    if (monthlyBudget > 0) {
        const remaining = monthlyBudget - totalWithEmis;
        remainingBudget.textContent = formatCurrency(remaining);
        
        // Update progress bar
        const percentage = Math.min((totalWithEmis / monthlyBudget) * 100, 100);
        budgetProgress.style.width = `${percentage}%`;
        
        // Change progress bar color based on percentage
        if (percentage >= 90) {
            budgetProgress.style.backgroundColor = 'var(--expense-color)';
        } else if (percentage >= 70) {
            budgetProgress.style.backgroundColor = 'orange';
        } else {
            budgetProgress.style.backgroundColor = 'var(--primary-color)';
        }
    }
}

// Set monthly budget
setBudgetButton.addEventListener('click', function() {
    const budgetAmount = parseFloat(budgetAmountInput.value);
    
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
        alert('Please enter a valid budget amount');
        return;
    }
    
    monthlyBudget = budgetAmount;
    localStorage.setItem('monthlyBudget', budgetAmount);
    
    updateBudgetDisplay();
    updateSummary();
});

// Update budget display
function updateBudgetDisplay() {
    budgetDisplay.textContent = formatCurrency(monthlyBudget);
    budgetAmountInput.placeholder = `Current: ${formatCurrency(monthlyBudget)}`;
}

// Render expense chart
function renderChart() {
    // Calculate category-wise expenses
    const categoryExpenses = {};
    
    transactions
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
            if (categoryExpenses[transaction.category]) {
                categoryExpenses[transaction.category] += transaction.amount;
            } else {
                categoryExpenses[transaction.category] = transaction.amount;
            }
        });
    
    // Add EMIs as a category if any exist
    const totalEmisAmount = emis.reduce((sum, emi) => sum + emi.amount, 0);
    if (totalEmisAmount > 0) {
        categoryExpenses['EMI/Loan'] = (categoryExpenses['EMI/Loan'] || 0) + totalEmisAmount;
    }
    
    // Prepare data for chart
    const categories = Object.keys(categoryExpenses);
    const amounts = Object.values(categoryExpenses);
    
    // Generate background colors based on theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const backgroundColors = generateChartColors(categories.length, isDarkTheme);
    
    // Get the canvas element
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    if (categories.length === 0) {
        // No data to show
        ctx.canvas.parentNode.style.display = 'flex';
        ctx.canvas.parentNode.style.justifyContent = 'center';
        ctx.canvas.parentNode.style.alignItems = 'center';
        ctx.canvas.style.display = 'none';
        
        const noDataMessage = document.createElement('div');
        noDataMessage.textContent = 'No expense data to display';
        noDataMessage.style.color = 'var(--text-color)';
        noDataMessage.style.fontStyle = 'italic';
        noDataMessage.id = 'no-data-message';
        
        // Remove existing message if any
        const existingMessage = document.getElementById('no-data-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        ctx.canvas.parentNode.appendChild(noDataMessage);
    } else {
        // Remove no data message if exists
        const noDataMessage = document.getElementById('no-data-message');
        if (noDataMessage) {
            noDataMessage.remove();
        }
        
        ctx.canvas.style.display = 'block';
        
        // Create the chart
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderColor: isDarkTheme ? '#1e1e1e' : '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'var(--text-color)',
                            font: {
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Generate colors for chart
function generateChartColors(count, isDarkTheme) {
    const baseColors = [
        isDarkTheme ? '#6d83f2' : '#4361ee',
        isDarkTheme ? '#ef5350' : '#f44336',
        isDarkTheme ? '#66bb6a' : '#4caf50',
        isDarkTheme ? '#ffca28' : '#ffc107',
        isDarkTheme ? '#7b5ee8' : '#3a0ca3',
        isDarkTheme ? '#26c6da' : '#00bcd4',
        isDarkTheme ? '#ba68c8' : '#9c27b0',
        isDarkTheme ? '#ff8a65' : '#ff5722',
        isDarkTheme ? '#ffb74d' : '#ff9800' // EMI color
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

// Initialize the application
init();