/** financeOS — ©adegbalajoshua — github.com/adegbalajoshua/financeos — MIT License */

/**
 * ==========================================
 * API & CACHING MODULE
 * Acts as the bridge between the Frontend (HTML) and Backend.
 * ==========================================
 */
const API = {

  /**
   * Fetches the dashboard payload. Uses CacheService for lightning-fast loads.
   * @param {string} requestedCycle - Optional. The cycle to load (e.g., 'Jul-26').
   * @returns {Object} JSON payload.
   */
  getDashboardData: function(requestedCycle) {
    try {
      // 1. Determine the active cycle if none was requested
      const settings = Database.getSettings();
      const targetCycle = requestedCycle || settings['Active_Cycle'];

      if (!targetCycle) {
        throw new Error("No active budget cycle found in Settings.");
      }

      // 2. Check the Cache first
      const cache = CacheService.getDocumentCache();
      const cacheKey = CONFIG.CACHE.KEY_PREFIX + targetCycle;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        // Cache Hit: Return instantly
        return JSON.parse(cachedData);
      }

      // 3. Cache Miss: Run the Engine
      const payload = FinanceEngine.generateDashboardPayload(targetCycle);

      // Add settings to the payload so the frontend knows the currency
      payload.settings = settings;

      // 4. Save to Cache (Convert object to string)
      cache.put(cacheKey, JSON.stringify(payload), CONFIG.CACHE.EXPIRATION_SEC);
      console.log(payload);
      return payload;

    } catch (error) {
      // Log the error cleanly and send it to the frontend
      console.error("API Error:", error);
      return { error: true, message: error.message };
    }
  },

  /**
   * Wipes the cache. Must be called whenever a new transaction is logged.
   */
  clearCache: function() {
    const settings = Database.getSettings();
    const activeCycle = settings['Active_Cycle'];
    if (activeCycle) {
      const cache = CacheService.getDocumentCache();
      cache.remove(CONFIG.CACHE.KEY_PREFIX + activeCycle);
    }
  }
};

/**
 * ==========================================
 * GLOBAL ENDPOINTS (Exposed to HTML Sidebar)
 * google.script.run can ONLY call global functions.
 * ==========================================
 */

function fetchDashboardPayload(cycle) {
  return API.getDashboardData(cycle);
}

function forceRefreshDashboard(cycle) {
  API.clearCache();
  return API.getDashboardData(cycle);
}

/**
 * Converts raw transaction input into ledger columns.
 * Returns { fromAccount, toAccount }.
 */
function resolveAccountColumns(formData) {

  const type = String(formData.type || '');

  const selectedAccount = String(formData.account || '');
  const destinationAccount = String(formData.toAccount || '');

  switch (type) {

    case 'Income':
      return {
        fromAccount: '',
        toAccount: selectedAccount
      };

    case 'Expense':
      return {
        fromAccount: selectedAccount,
        toAccount: ''
      };

    case 'Transfer':
      if (!destinationAccount) {
        throw new Error('Destination account is required.');
      }

      if (selectedAccount === destinationAccount) {
        throw new Error('Source and destination accounts must be different.');
      }

      return {
        fromAccount: selectedAccount,
        toAccount: destinationAccount
      };

    case 'Saving':
      return {
        fromAccount: selectedAccount,
        toAccount: destinationAccount || ''
      };

    case 'Bank Charge':
      return {
        fromAccount: selectedAccount,
        toAccount: ''
      };

    case 'Receivable':
      return {
        fromAccount: '',
        toAccount: ''
      };

    default:
      return {
        fromAccount: selectedAccount,
        toAccount: destinationAccount
      };
  }
}

function submitNewTransaction(formData) {

  try {

    const settings = Database.getSettings();
    const cycle = settings['Active_Cycle'];

    if (!cycle) {
      throw new Error('No active budget cycle found.');
    }

    const amount = Number(formData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount.');
    }

    const {
      fromAccount,
      toAccount
    } = resolveAccountColumns(formData);

    const formattedDate =
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'dd-MMM-yy'
      );

    const transactionId = Utilities.getUuid();

    const newRow = [
      formattedDate,
      cycle,
      formData.type,
      formData.category,
      (formData.description || '').trim(),
      fromAccount,
      toAccount,
      amount,
      formData.notes || '',
      transactionId
    ];

    Database.appendTransaction(newRow);

    API.clearCache();

    return {
      success: true,
      id: transactionId
    };

  } catch (error) {

    return {
      error: true,
      message: error.message
    };

  }

}

/**
 * Updates an existing Daily Log row. Type, Date, and Budget Cycle are
 * preserved from the original row; category, account(s), amount, and
 * description can change.
 */
function updateTransaction(transactionId, formData) {

  try {

    if (!transactionId) {
      throw new Error('Missing transaction ID.');
    }

    const rowIndex = Database.findTransactionRow(transactionId);

    if (rowIndex === -1) {
      throw new Error('Transaction not found. It may have been deleted or edited directly in the sheet.');
    }

    const existingRow = Database
      .getSheet(CONFIG.SHEETS.LOG)
      .getRange(rowIndex, 1, 1, CONFIG.LOG_SCHEMA.COLUMN_COUNT)
      .getDisplayValues()[0];

    const amount = Number(formData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount.');
    }

    const {
      fromAccount,
      toAccount
    } = resolveAccountColumns(formData);

    const updatedRow = [
      existingRow[0],
      existingRow[1],
      formData.type,
      formData.category,
      (formData.description || '').trim(),
      fromAccount,
      toAccount,
      amount,
      'Dashboard Entry (Edited)',
      transactionId
    ];

    Database.updateTransactionRow(rowIndex, updatedRow);

    API.clearCache();

    return { success: true };

  } catch (error) {

    return {
      error: true,
      message: error.message
    };

  }

}

/**
 * Deletes a Daily Log row by Transaction ID.
 */
function deleteTransaction(transactionId) {

  try {

    if (!transactionId) {
      throw new Error('Missing transaction ID.');
    }

    const rowIndex = Database.findTransactionRow(transactionId);

    if (rowIndex === -1) {
      throw new Error('Transaction not found. It may have already been deleted.');
    }

    Database.deleteTransactionRow(rowIndex);

    API.clearCache();

    return { success: true };

  } catch (error) {

    return {
      error: true,
      message: error.message
    };

  }

}

/**
 * Read-only aggregate for the Trends view.
 */
function fetchTrendsData() {
  try {
    return FinanceEngine.generateTrendsPayload();
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Returns accounts and the active cycle's budget lines for the Manage panel.
 */
function fetchManageData() {
  try {
    const settings = Database.getSettings();
    const cycle = settings['Active_Cycle'];
    const accounts = Database.getSheetDataAsObjects(CONFIG.SHEETS.ACCOUNTS);
    const allBudgets = Database.getSheetDataAsObjects(CONFIG.SHEETS.BUDGET);
    const cycleBudgets = allBudgets.filter(b => b['Budget Cycle'] === cycle);

    return {
      cycle: cycle,
      accounts: accounts.map(a => ({
        name: a['Account Name'],
        type: a['Account Type'],
        openingBalance: FinanceEngine._parseNum(a['Opening Balance']),
        status: a['Status']
      })),
      budgets: cycleBudgets.map(b => ({
        type: b['Type'],
        category: b['Category'],
        amount: FinanceEngine._parseNum(b['Budget Amount'])
      }))
    };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Creates a new account, or updates an existing one matched by name.
 */
function submitAccount(formData) {
  try {
    const name = (formData.name || '').trim();
    if (!name) throw new Error('Account name is required.');

    const type = formData.type;
    if (!['Bank', 'Mobile', 'Cash', 'Savings'].includes(type)) {
      throw new Error('Invalid account type.');
    }

    const openingBalance = Number(formData.openingBalance) || 0;
    const status = formData.status === 'Inactive' ? 'Inactive' : 'Active';

    const rowIndex = Database.findAccountRow(name);
    const row = [name, type, openingBalance, status];

    if (rowIndex === -1) {
      Database.appendAccountRow(row);
    } else {
      Database.updateAccountRow(rowIndex, row);
    }

    API.clearCache();
    return { success: true };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Soft-deletes an account by setting Status to Inactive. Never hard-deletes,
 * Daily Log rows reference accounts by name and a hard delete would orphan
 * historical balance calculations.
 */
function deactivateAccount(name) {
  try {
    const rowIndex = Database.findAccountRow(name);
    if (rowIndex === -1) throw new Error('Account not found.');

    const sheet = Database.getSheet(CONFIG.SHEETS.ACCOUNTS);
    const row = sheet.getRange(rowIndex, 1, 1, 4).getDisplayValues()[0];
    row[3] = 'Inactive';
    Database.updateAccountRow(rowIndex, row);

    API.clearCache();
    return { success: true };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Creates or updates a budget line for the active cycle, matched by
 * (Type, Category).
 */
function submitBudgetLine(formData) {
  try {
    const settings = Database.getSettings();
    const cycle = settings['Active_Cycle'];
    if (!cycle) throw new Error('No active budget cycle found.');

    const type = formData.type;
    if (!['Expense', 'Saving'].includes(type)) {
      throw new Error('Budget type must be Expense or Saving.');
    }

    const category = (formData.category || '').trim();
    if (!category) throw new Error('Category is required.');

    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid budget amount.');
    }

    const rowIndex = Database.findBudgetRow(cycle, type, category);
    const row = [cycle, type, category, amount];

    if (rowIndex === -1) {
      Database.appendBudgetRow(row);
    } else {
      Database.updateBudgetRow(rowIndex, row);
    }

    API.clearCache();
    return { success: true };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Removes a budget line from the active cycle.
 */
function deleteBudgetLine(type, category) {
  try {
    const settings = Database.getSettings();
    const cycle = settings['Active_Cycle'];
    const rowIndex = Database.findBudgetRow(cycle, type, category);
    if (rowIndex === -1) throw new Error('Budget line not found.');

    Database.deleteBudgetRow(rowIndex);
    API.clearCache();
    return { success: true };
  } catch (error) {
    return { error: true, message: error.message };
  }
}