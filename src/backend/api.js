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
        toAccount: selectedAccount
      };

    default:
      return {
        fromAccount: selectedAccount,
        toAccount: destinationAccount
      };
  }
}

/**
 * Receives a new transaction from the frontend dashboard, formats it, 
 * appends it to the Daily Log, and clears the cache.
 */
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

    const newRow = [
      formattedDate,
      cycle,
      formData.type,
      formData.category,
      (formData.description || '').trim(),
      fromAccount,
      toAccount,
      amount,
      formData.notes || ''
    ];

    Database.appendTransaction(newRow);

    API.clearCache();

    return {
      success: true
    };

  } catch (error) {

    return {
      error: true,
      message: error.message
    };

  }

}