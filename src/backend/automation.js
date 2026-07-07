/**
 * ==========================================
 * AUTOMATION MODULE
 * Handles complex multi-step workflows.
 * ==========================================
 */

function startNewCycle() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Identify the current state
  const settings = Database.getSettings();
  const currentCycle = settings['Active_Cycle'];
  
  if (!currentCycle) {
    ui.alert('Error: No active cycle found in Settings.');
    return;
  }

  // 2. Prompt for the New Cycle Name
  const cyclePrompt = ui.prompt(
    'Step 1: New Budget Cycle', 
    `Your current cycle is ${currentCycle}.\n\nEnter the name for the NEW cycle (e.g., Aug-26):`, 
    ui.ButtonSet.OK_CANCEL
  );
  
  if (cyclePrompt.getSelectedButton() !== ui.Button.OK) return;
  const newCycle = cyclePrompt.getResponseText().trim();
  if (!newCycle) return;

  // 3. Prompt for Salary
  const salaryPrompt = ui.prompt(
    'Step 2: Fund the Cycle', 
    `Enter your net salary amount funding ${newCycle} (numbers only, no commas):`, 
    ui.ButtonSet.OK_CANCEL
  );
  
  if (salaryPrompt.getSelectedButton() !== ui.Button.OK) return;
  const salaryAmount = Number(salaryPrompt.getResponseText().replace(/,/g, ''));
  
  if (isNaN(salaryAmount) || salaryAmount <= 0) {
    ui.alert('Invalid salary amount. Process aborted so your data remains safe.');
    return;
  }

  // --- BEGIN AUTOMATED DATABASE WRITES ---

  // 4. Log the Salary Transaction automatically
  const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  const today = new Date();
  
  // Array maps exactly to: [Date, Budget Cycle, Type, Category, Description, From, To, Amount, Notes]
  logSheet.appendRow([
    today,               
    newCycle,            
    'Income',            
    'Salary',            
    'Monthly Paycheck',          
    '',                  
    'Zenith',            // Note: Automatically routing to Zenith. Change if needed!
    salaryAmount,        
    `Auto-funded ${newCycle}` 
  ]);

  // 5. Rollover Budgets
  const budgetSheet = ss.getSheetByName(CONFIG.SHEETS.BUDGET);
  const allBudgets = Database.getSheetDataAsObjects(CONFIG.SHEETS.BUDGET);
  
  // Find all budgets attached to the old cycle
  const oldBudgets = allBudgets.filter(b => b['Budget Cycle'] === currentCycle);
  
  if (oldBudgets.length > 0) {
    // Map them to the new cycle
    const newBudgetRows = oldBudgets.map(b => [
      newCycle,
      b['Type'],
      b['Category'],
      b['Budget Amount']
    ]);
    
    // Batch write them to the bottom of the Budget Setup sheet for high performance
    budgetSheet.getRange(budgetSheet.getLastRow() + 1, 1, newBudgetRows.length, 4).setValues(newBudgetRows);
  }

  // 6. Update global Settings to make the new cycle active
  const settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const settingsData = settingsSheet.getDataRange().getValues();
  
  for (let i = 0; i < settingsData.length; i++) {
    if (settingsData[i][0] === 'Active_Cycle') {
      settingsSheet.getRange(i + 1, 2).setValue(newCycle);
      break;
    }
  }

  // 7. Clear the backend cache so the Dashboard loads fresh
  API.clearCache();
  
  // 8. Success Message
  ui.alert(`🎉 Success! ${newCycle} is live.\n\n- ₦${salaryAmount.toLocaleString()} logged to Zenith.\n- Previous budgets copied.\n- Dashboard updated.`);
}