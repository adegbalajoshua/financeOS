/** financeOS — ©adegbalajoshua — github.com/adegbalajoshua/financeos — MIT License */

/**
 * ============================================================================
 * Database Module
 * ============================================================================
 *
 * Purpose:
 *   Serves as the application's Data Access Layer (DAL), encapsulating all
 *   direct interactions with Google Sheets.
 *
 * Responsibilities:
 *   - Read worksheet data.
 *   - Persist application data.
 *   - Manage application settings.
 *   - Abstract Google Sheets operations from business logic.
 *
 * Design Principles:
 *   - Centralize all spreadsheet interactions.
 *   - Expose simple, reusable data operations.
 *   - Prevent business modules from accessing SpreadsheetApp directly.
 *   - Provide a single source of truth for persistence logic.
 *
 * Dependencies:
 *   - SpreadsheetApp
 *   - CONFIG
 *
 * ============================================================================
 */

const Database = {

  //==========================================================================
  // Public Methods
  //==========================================================================

  /**
   * Returns a worksheet by name.
   *
   * @param {string} sheetName
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   * @throws {Error} If the worksheet does not exist.
   */
  getSheet(sheetName) {

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Worksheet "${sheetName}" could not be found.`);
    }

    return sheet;

  },

  /**
   * Reads a worksheet and returns each row as an object using the
   * first row as column headers.
   *
   * @param {string} sheetName
   * @returns {Object[]}
   */
  getSheetDataAsObjects(sheetName) {

    const sheet = this.getSheet(sheetName);

    const values = sheet
      .getDataRange()
      .getDisplayValues();

    if (values.length <= 1) {
      return [];
    }

    const headers = values[0];
    const rows = values.slice(1);

    return rows.map(row => {

      const obj = {};

      headers.forEach((header, index) => {

        if (header) {
          obj[header] = row[index];
        }

      });

      return obj;

    });

  },

  /**
   * Retrieves application settings as a key/value object.
   *
   * Example:
   * {
   *   Active_Cycle: 'Jul-26',
   *   Currency: '₦'
   * }
   *
   * @returns {Object}
   */
  getSettings() {

    const rows = this.getSheetDataAsObjects(CONFIG.SHEETS.SETTINGS);

    const settings = {};

    rows.forEach(row => {

      if (row.Key && row.Value !== '') {
        settings[row.Key] = row.Value;
      }

    });

    return settings;

  },

  /**
   * Updates a setting in the Settings worksheet.
   *
   * @param {string} key
   * @param {*} value
   */
  updateSetting(key, value) {

    const sheet = this.getSheet(CONFIG.SHEETS.SETTINGS);

    const values = sheet
      .getDataRange()
      .getValues();

    for (let row = 0; row < values.length; row++) {

      if (values[row][0] === key) {

        sheet
          .getRange(row + 1, 2)
          .setValue(value);

        return;

      }

    }

    throw new Error(`Setting "${key}" does not exist.`);

  },

  /**
   * Appends a transaction to the Daily Log worksheet.
   *
   * @param {Array} transaction
   */
  appendTransaction(transaction) {

    this
      .getSheet(CONFIG.SHEETS.LOG)
      .appendRow(transaction);

  },

  /**
   * Finds the 1-indexed sheet row for a transaction by its Transaction ID.
   * Returns -1 if not found (deleted, or predates the ID column).
   *
   * @param {string} transactionId
   * @returns {number}
   */
  findTransactionRow(transactionId) {

    const sheet = this.getSheet(CONFIG.SHEETS.LOG);
    const values = sheet.getDataRange().getDisplayValues();
    const headers = values[0];
    const idCol = headers.indexOf(CONFIG.LOG_SCHEMA.ID_HEADER);

    if (idCol === -1) {
      throw new Error(
        `Daily Log is missing the "${CONFIG.LOG_SCHEMA.ID_HEADER}" column. See docs/TROUBLESHOOTING.md.`
      );
    }

    for (let i = 1; i < values.length; i++) {
      if (values[i][idCol] === transactionId) {
        return i + 1;
      }
    }

    return -1;

  },

  /**
   * Overwrites an existing Daily Log row in place.
   *
   * @param {number} rowIndex 1-indexed sheet row.
   * @param {Array} transaction
   */
  updateTransactionRow(rowIndex, transaction) {

    this.getSheet(CONFIG.SHEETS.LOG)
      .getRange(rowIndex, 1, 1, transaction.length)
      .setValues([transaction]);

  },

  /**
   * Deletes a single row from Daily Log.
   *
   * @param {number} rowIndex 1-indexed sheet row.
   */
  deleteTransactionRow(rowIndex) {

    this.getSheet(CONFIG.SHEETS.LOG).deleteRow(rowIndex);

  },

  /**
   * Finds the 1-indexed sheet row for an account by name.
   */
  findAccountRow(accountName) {

    const sheet = this.getSheet(CONFIG.SHEETS.ACCOUNTS);
    const values = sheet.getDataRange().getDisplayValues();
    const headers = values[0];
    const nameCol = headers.indexOf('Account Name');

    for (let i = 1; i < values.length; i++) {
      if (values[i][nameCol] === accountName) {
        return i + 1;
      }
    }

    return -1;

  },

  /**
   * Appends a single account row.
   */
  appendAccountRow(row) {

    this.getSheet(CONFIG.SHEETS.ACCOUNTS).appendRow(row);

  },

  /**
   * Overwrites an existing account row in place.
   */
  updateAccountRow(rowIndex, row) {

    this.getSheet(CONFIG.SHEETS.ACCOUNTS)
      .getRange(rowIndex, 1, 1, row.length)
      .setValues([row]);

  },

  /**
   * Finds the 1-indexed sheet row for a budget line by
   * (Budget Cycle, Type, Category).
   */
  findBudgetRow(cycle, type, category) {

    const sheet = this.getSheet(CONFIG.SHEETS.BUDGET);
    const values = sheet.getDataRange().getDisplayValues();
    const headers = values[0];
    const cycleCol = headers.indexOf('Budget Cycle');
    const typeCol = headers.indexOf('Type');
    const catCol = headers.indexOf('Category');

    for (let i = 1; i < values.length; i++) {
      if (
        values[i][cycleCol] === cycle &&
        values[i][typeCol] === type &&
        values[i][catCol] === category
      ) {
        return i + 1;
      }
    }

    return -1;

  },

  /**
   * Appends a single budget row. For batch inserts (cycle rollover),
   * use appendBudgetRows instead.
   */
  appendBudgetRow(row) {

    this.getSheet(CONFIG.SHEETS.BUDGET).appendRow(row);

  },

  /**
   * Overwrites an existing budget row in place.
   */
  updateBudgetRow(rowIndex, row) {

    this.getSheet(CONFIG.SHEETS.BUDGET)
      .getRange(rowIndex, 1, 1, row.length)
      .setValues([row]);

  },

  /**
   * Deletes a single budget row.
   */
  deleteBudgetRow(rowIndex) {

    this.getSheet(CONFIG.SHEETS.BUDGET).deleteRow(rowIndex);

  },

  /**
   * Appends multiple budget rows in a single batch operation.
   *
   * @param {Array<Array>} rows
   */
  appendBudgetRows(rows) {

    if (!rows.length) return;

    const sheet = this.getSheet(CONFIG.SHEETS.BUDGET);

    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        rows.length,
        rows[0].length
      )
      .setValues(rows);

  },

  /**
   * Removes all charts from a worksheet.
   *
   * @param {string} sheetName
   */
  clearCharts(sheetName) {

    const sheet = this.getSheet(sheetName);

    sheet
      .getCharts()
      .forEach(chart => sheet.removeChart(chart));

  },

  /**
   * Clears all worksheet contents.
   *
   * @param {string} sheetName
   */
  clearSheet(sheetName) {

    this
      .getSheet(sheetName)
      .clear();

  }

};