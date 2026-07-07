/**
 * ============================================================================
 * Application Configuration
 * ============================================================================
 *
 * Purpose:
 *   Centralizes all application constants, configuration values, and default
 *   settings used throughout financeOS.
 *
 * Responsibilities:
 *   - Define worksheet names.
 *   - Store cache configuration.
 *   - Provide application defaults.
 *   - Maintain chart styling.
 *   - Eliminate hardcoded values from business logic.
 *
 * Design Principles:
 *   - Single source of truth for configuration.
 *   - Group related settings into logical sections.
 *   - Keep business logic free of magic strings and numbers.
 *   - Prefer descriptive constant names over inline literals.
 *
 * ============================================================================
 */

const CONFIG = {

  //==========================================================================
  // Worksheet Names
  //==========================================================================

  SHEETS: {
    SETTINGS: 'Settings',
    ACCOUNTS: 'Accounts',
    BUDGET: 'Budget Setup',
    LOG: 'Daily Log',
    ANALYTICS: 'Analytics'
  },

  //==========================================================================
  // Dashboard Cache
  //==========================================================================

  CACHE: {
    EXPIRATION_SEC: 300,
    KEY_PREFIX: 'FINANCE_OS_'
  },

  //==========================================================================
  // Default Transaction Values
  //==========================================================================

  DEFAULTS: {

    TYPE: 'Expense',

    CATEGORY: 'Discretionary',

    ACCOUNT: 'Zenith',

    SALARY_CATEGORY: 'Salary',

    SALARY_DESCRIPTION: 'Monthly Paycheck',

    TELEGRAM_NOTE: 'Logged via Telegram'

  },

  //==========================================================================
  // Budget Cycle
  //==========================================================================

  BUDGET: {

    ACTIVE_CYCLE_KEY: 'Active_Cycle'

  },

  //==========================================================================
  // Chart Styling
  //==========================================================================

  CHARTS: {

    PRIMARY: '#4f46e5',

    SUCCESS: '#10b981',

    WARNING: '#f59e0b',

    DANGER: '#ef4444',

    PALETTE: [
      '#4f46e5',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899'
    ]

  },

  //==========================================================================
  // UI
  //==========================================================================

  UI: {

    APP_NAME: 'financeOS',

    DASHBOARD_TITLE: 'financeOS'

  }

};