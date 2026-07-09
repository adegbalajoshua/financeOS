/** FinanceOS — ©adegbalajoshua — github.com/adegbalajoshua/financeos — MIT License */
/**
 * ==========================================
 * FINANCE ENGINE MODULE
 * The core business logic for the application.
 * ==========================================
 */
const FinanceEngine = {

  /**
   * Cleans messy display values (like "₦70,000") into pure JavaScript numbers.
   */
  _parseNum: function(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    // Strip everything except digits, decimals, and minus signs
    const cleanString = String(value).replace(/[^0-9.-]+/g, "");
    return Number(cleanString) || 0;
  },

  /**
   * Orchestrates data from the database and calculates all Dashboard KPIs.
   */
  generateDashboardPayload: function(targetCycle) {
    const allTransactions = Database.getSheetDataAsObjects(CONFIG.SHEETS.LOG);
    const allBudgets = Database.getSheetDataAsObjects(CONFIG.SHEETS.BUDGET);
    const initialAccounts = Database.getSheetDataAsObjects(CONFIG.SHEETS.ACCOUNTS);

    const balances = this._calculateAccountBalances(initialAccounts, allTransactions);
    const cycleTransactions = allTransactions.filter(tx => tx['Budget Cycle'] === targetCycle);
    const cycleBudgets = allBudgets.filter(b => b['Budget Cycle'] === targetCycle);

    const summary = this._summarizeCycle(cycleTransactions);
    const expenses = this._mergeBudgets(cycleBudgets, summary.actualsMap, 'Expense');
    const savings = this._mergeBudgets(cycleBudgets, summary.actualsMap, 'Saving');
    const recentTransactions = this._getRecentTransactions(cycleTransactions, 8);

    return {
      cycle: targetCycle,
      kpis: {
        income: summary.totalIncome,
        spent: summary.totalSpent,
        bankCharges: summary.bankCharges,
        liquidCash: balances.liquidTotal,
        receivables: summary.totalReceivables
      },
      accounts: balances.accountList,
      expenses: expenses,
      savings: savings,
      receivableList: summary.receivableList,
      recentTransactions: recentTransactions
    };
  },

  _calculateAccountBalances: function(accounts, allTransactions) {
    let balanceMap = {};
    let liquidTotal = 0;
    let accountList = [];

    accounts.forEach(acc => {
      if (acc['Status'] === 'Active') {
        const amount = this._parseNum(acc['Opening Balance']);
        balanceMap[acc['Account Name']] = {
          balance: amount,
          type: acc['Account Type']
        };
      }
    });

    allTransactions.forEach(tx => {
      const amount = this._parseNum(tx['Amount']);
      const fromAcc = tx['From Account'];
      const toAcc = tx['To Account'];

      if (fromAcc && balanceMap[fromAcc]) balanceMap[fromAcc].balance -= amount;
      if (toAcc && balanceMap[toAcc]) balanceMap[toAcc].balance += amount;
    });

    for (const [name, data] of Object.entries(balanceMap)) {
      accountList.push({ name: name, balance: data.balance });
      
      if (['Bank', 'Mobile', 'Cash'].includes(data.type)) {
        liquidTotal += data.balance;
      }
    }

    return { balanceMap, liquidTotal, accountList };
  },

  _summarizeCycle: function(cycleTransactions) {
    let totalIncome = 0;
    let totalSpent = 0;
    let bankCharges = 0;
    let totalReceivables = 0;
    let actualsMap = {}; 
    let receivableList = [];

    cycleTransactions.forEach(tx => {
      const amount = this._parseNum(tx['Amount']);
      const type = tx['Type'];
      const category = tx['Category'];

      if (type === 'Income') totalIncome += amount;
      if (type === 'Expense') {
        totalSpent += amount;
        actualsMap[category] = (actualsMap[category] || 0) + amount;
      }
      if (type === 'Saving') {
        actualsMap[category] = (actualsMap[category] || 0) + amount;
      }
      if (type === 'Bank Charge') bankCharges += amount;
      
      if (type === 'Receivable') {
        totalReceivables += amount;
        receivableList.push({ desc: tx['Description'], amount: amount });
      }
    });

    return { totalIncome, totalSpent, bankCharges, totalReceivables, actualsMap, receivableList };
  },

  _mergeBudgets: function(cycleBudgets, actualsMap, typeFilter) {
    const filteredBudgets = cycleBudgets.filter(b => b['Type'] === typeFilter);
    
    return filteredBudgets.map(b => {
      const cat = b['Category'];
      const budgetAmount = this._parseNum(b['Budget Amount']);
      const spentAmount = actualsMap[cat] || 0;
      
      return {
        category: cat,
        budget: budgetAmount,
        spent: spentAmount,
        remaining: budgetAmount - spentAmount,
        percentUsed: budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0
      };
    });
  },

  /**
   * Returns the most recent N transactions for a cycle, newest first.
   * Rows are only ever appended (see Database.appendTransaction), so the
   * tail of the array is already chronological. No date parsing needed
   * against the display-string Date column.
   */
/**
   * Returns the most recent N transactions for a cycle, newest first.
   * Rows are only ever appended (see Database.appendTransaction), so the
   * tail of the array is already chronological.
   */
  _getRecentTransactions: function(cycleTransactions, limit) {
    return cycleTransactions
      .slice(-limit)
      .reverse()
      .map(tx => ({
        id: tx['Transaction ID'] || null,
        date: tx['Date'],
        desc: tx['Description'],
        amount: this._parseNum(tx['Amount']),
        type: tx['Type'],
        category: tx['Category'],
        fromAccount: tx['From Account'] || '',
        toAccount: tx['To Account'] || ''
      }));
  }
};