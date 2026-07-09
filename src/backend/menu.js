/** FinanceOS — ©adegbalajoshua — github.com/adegbalajoshua/financeos — MIT License */
/**
 * ============================================================================
 * Menu Module
 * ============================================================================
 *
 * Purpose:
 * Integrates financeOS into the Google Sheets user interface by registering
 * custom menu entries and launching application views.
 *
 * Responsibilities:
 * - Create the financeOS menu when the spreadsheet is opened.
 * - Provide entry points for launching application features.
 * - Bridge Google Sheets UI events to backend functionality.
 *
 * Design Principles:
 * - Keep UI registration separate from business logic.
 * - Delegate all application functionality to specialized modules.
 * - Act only as a navigation layer.
 *
 * Dependencies:
 * - HtmlService
 * - SpreadsheetApp
 *
 * ============================================================================
 */

const Menu = {

  //==========================================================================
  // Public Methods
  //==========================================================================

  /**
   * Registers the financeOS custom menu when the spreadsheet opens.
   *
   * This function is invoked automatically by the Apps Script `onOpen`
   * simple trigger and exposes the primary application features through
   * the Google Sheets menu bar.
   */
build() {
    SpreadsheetApp.getUi()
      .createMenu('financeOS')
      .addItem('Launch Dashboard', 'openDashboard')
      .addSeparator()
      .addItem('Start New Budget Cycle', 'startNewCycle')
      .addItem('Generate Analytics', 'buildAnalyticsDashboard')
      .addSeparator()
      .addItem('Backfill Transaction IDs', 'backfillTransactionIds')
      .addItem('About financeOS', 'showAbout')
      .addToUi();
  },

  /**
   * Opens the financeOS dashboard.
   *
   * Evaluates the Dashboard template to inject CSS/JS and opens it 
   * as a wide modal dialog to support the responsive layout.
   */
  launchDashboard() {
    const html = HtmlService
      .createTemplateFromFile('dashboard')
      .evaluate()
      .setTitle('financeOS Command Center')
      .setWidth(1200)
      .setHeight(800);

    SpreadsheetApp.getUi().showModalDialog(html, 'FinanceOS');
  },

/**
   * Displays project and author information with a clickable repository link.
   */
  showAbout() {
    const html = HtmlService
      .createHtmlOutputFromFile('about')
      .setWidth(360)
      .setHeight(280);

    SpreadsheetApp.getUi().showModalDialog(html, 'About financeOS');
  }


};

//==============================================================================
// Google Apps Script Entry Points
//==============================================================================

/**
 * Simple trigger executed automatically whenever the spreadsheet is opened.
 */
function onOpen() {
  Menu.build();
}

/**
 * Global endpoint invoked from the custom menu.
 */
function openDashboard() {
  Menu.launchDashboard();
}

/**
 * Global endpoint invoked from the custom menu.
 */
function showAbout() {
  Menu.showAbout();
}

