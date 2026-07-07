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