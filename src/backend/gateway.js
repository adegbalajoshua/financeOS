/**
 * ========================================================
 * FINANCE OS WEBHOOK
 * Handles incoming JSON, enforces data types, and
 * prevents Google Sheets from auto-formatting text.
 * ========================================================
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
    const settings = Database.getSettings();

    // 1. HARDWIRED PARSER (Split by colon)
    // Usage: "Description : Amount" (e.g., "Coffee : 1500")
    const rawText = payload.desc || ""; 
    const parts = rawText.split(':');
    
    // Safety check: trim spaces and handle missing parts
    const description = parts[0] ? String(parts[0].trim()) : "Manual Entry";
    const amount = parts[1] ? Number(parts[1].trim()) : 0;

    // 2. EXPLICIT TYPE CASTING
    const dateObj = payload.date ? new Date(payload.date) : new Date();
    const timeZone = Session.getScriptTimeZone(); // Uses your spreadsheet's timezone
    const formattedDate = Utilities.formatDate(dateObj, timeZone, "dd-MMM-yy");
    const cycle = String(payload.cycle || settings['Active_Cycle'] || "N/A");
    const type = String(payload.type || 'Expense');
    const category = String(payload.cat || settings['Default_Category'] || 'Discretionary');
    const account = String(payload.account || settings['Default_Account'] || 'Zenith');
    const toAccount = String(payload.to || '');

    // 3. APPEND DATA
    const newRow = [
      formattedDate,           // Col 1: Date object
      cycle,          // Col 2: Forced string
      type,           // Col 3: Forced string
      category,       // Col 4: Forced string
      description,    // Col 5: Forced string
      account,        // Col 6: Forced string
      toAccount,      // Col 7: Forced string
      amount,         // Col 8: Number
      'Logged Via Telegram'
    ];
    
    logSheet.appendRow(newRow);

    // 4. FORCE COLUMN FORMATTING
    // Forces the 'Budget Cycle' column (Col B) to be Plain Text to prevent date conversion
    const lastRow = logSheet.getLastRow();
    logSheet.getRange(lastRow, 1, 1, 2).setNumberFormat("@");

    // 5. CACHE REFRESH
    API.clearCache();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: `Logged: ${description} (${amount})`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}