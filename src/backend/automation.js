/**
 * ==========================================
 * AUTOMATION MODULE
 * Handles complex multi-step workflows.
 * ==========================================
 */

function startNewCycle() {

  const ui = SpreadsheetApp.getUi();

  //--------------------------------------------------------------------------
  // Step 1 - Read current settings
  //--------------------------------------------------------------------------

  const settings = Database.getSettings();
  const currentCycle = settings['Active_Cycle'];

  if (!currentCycle) {
    ui.alert('Error: No active cycle found in Settings.');
    return;
  }

  //--------------------------------------------------------------------------
  // Step 2 - Prompt for the new cycle
  //--------------------------------------------------------------------------

  const cyclePrompt = ui.prompt(
    'Step 1: New Budget Cycle',
    `Your current cycle is ${currentCycle}.\n\nEnter the name for the NEW cycle (e.g. Aug-26):`,
    ui.ButtonSet.OK_CANCEL
  );

  if (cyclePrompt.getSelectedButton() !== ui.Button.OK) return;

  const newCycle = cyclePrompt.getResponseText().trim();

  if (!newCycle) return;

  //--------------------------------------------------------------------------
  // Step 3 - Prompt for salary
  //--------------------------------------------------------------------------

  const salaryPrompt = ui.prompt(
    'Step 2: Fund the Cycle',
    `Enter your net salary amount funding ${newCycle} (numbers only):`,
    ui.ButtonSet.OK_CANCEL
  );

  if (salaryPrompt.getSelectedButton() !== ui.Button.OK) return;

  const salaryAmount = Number(
    salaryPrompt
      .getResponseText()
      .replace(/,/g, '')
  );

  if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
    ui.alert(
      'Invalid salary amount.\n\nProcess cancelled so your data remains unchanged.'
    );
    return;
  }

  //--------------------------------------------------------------------------
  // Step 4 - Log the salary transaction
  //--------------------------------------------------------------------------

  const result = submitNewTransaction({

    budgetCycle: newCycle,

    type: 'Income',

    category: CONFIG.DEFAULTS.SALARY_CATEGORY,

    description: CONFIG.DEFAULTS.SALARY_DESCRIPTION,

    account: CONFIG.DEFAULTS.ACCOUNT,

    amount: salaryAmount,

    notes: `Auto-funded ${newCycle}`

  });

  if (result.error) {
    ui.alert(result.message);
    return;
  }

  //--------------------------------------------------------------------------
  // Step 5 - Copy previous budgets
  //--------------------------------------------------------------------------

  const allBudgets =
    Database.getSheetDataAsObjects(CONFIG.SHEETS.BUDGET);

  const oldBudgets =
    allBudgets.filter(
      b => b['Budget Cycle'] === currentCycle
    );

  if (oldBudgets.length) {

    const rows = oldBudgets.map(b => [

      newCycle,

      b['Type'],

      b['Category'],

      b['Budget Amount']

    ]);

    Database.appendBudgetRows(rows);

  }

  //--------------------------------------------------------------------------
  // Step 6 - Activate the new cycle
  //--------------------------------------------------------------------------

  Database.updateSetting(
    CONFIG.BUDGET.ACTIVE_CYCLE_KEY,
    newCycle
  );

  //--------------------------------------------------------------------------
  // Step 7 - Refresh cache
  //--------------------------------------------------------------------------

  API.clearCache();

  //--------------------------------------------------------------------------
  // Step 8 - Notify user
  //--------------------------------------------------------------------------

  ui.alert(
    [
      `🎉 ${newCycle} is now active.`,
      '',
      `✓ Salary of ₦${salaryAmount.toLocaleString()} deposited into ${CONFIG.DEFAULTS.ACCOUNT}.`,
      '✓ Budgets rolled over.',
      '✓ Dashboard cache refreshed.'
    ].join('\n')
  );




}
  /**
 * One-time migration helper. Populates Transaction ID for any Daily Log
 * row that predates the column (required for Edit/Delete from the
 * dashboard to work on older transactions). Safe to re-run, only fills
 * blanks.
 */

function backfillTransactionIds() {

  const ui = SpreadsheetApp.getUi();
  const sheet = Database.getSheet(CONFIG.SHEETS.LOG);
  const values = sheet.getDataRange().getDisplayValues();

  if (values.length <= 1) {
    ui.alert('No transactions found.');
    return;
  }

  const headers = values[0];
  const idCol = headers.indexOf(CONFIG.LOG_SCHEMA.ID_HEADER);

  if (idCol === -1) {
    ui.alert(
      `Add a "${CONFIG.LOG_SCHEMA.ID_HEADER}" column as the last column in Daily Log first, then re-run this.`
    );
    return;
  }

  let filled = 0;

  for (let i = 1; i < values.length; i++) {
    if (!values[i][idCol]) {
      sheet.getRange(i + 1, idCol + 1).setValue(Utilities.getUuid());
      filled++;
    }
  }

  ui.alert(`Backfilled ${filled} transaction(s) with a new Transaction ID.`);

}