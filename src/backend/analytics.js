/**
 * ==========================================
 * ANALYTICS MODULE
 * Dynamically generates native Google Sheets charts.
 * ==========================================
 */

function buildAnalyticsDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get or create the Analytics sheet
  let sheet = ss.getSheetByName('Analytics');
  if (!sheet) {
    sheet = ss.insertSheet('Analytics');
  } else {
    sheet.clear(); // Wipe the slate clean
    const charts = sheet.getCharts();
    charts.forEach(c => sheet.removeChart(c)); // Remove old charts
  }

  // 1. Fetch the data using our existing engine
  const settings = Database.getSettings();
  const activeCycle = settings['Active_Cycle'];
  const payload = FinanceEngine.generateDashboardPayload(activeCycle);

  if (payload.error) {
    SpreadsheetApp.getUi().alert('Cannot build analytics: ' + payload.message);
    return;
  }

  // 2. Prepare the data tables (we will hide these later)
  sheet.getRange('A1').setValue(`Analytics for ${activeCycle}`).setFontWeight('bold').setFontSize(14);
  
  // Table A: Expenses for Pie Chart
  sheet.getRange('A3:B3').setValues([['Category', 'Spent']]).setFontWeight('bold');
  let expRow = 4;
  payload.expenses.forEach(exp => {
    if (exp.spent > 0) {
      sheet.getRange(expRow, 1).setValue(exp.category);
      sheet.getRange(expRow, 2).setValue(exp.spent);
      expRow++;
    }
  });

  // Table B: Cash Flow for Column Chart
  sheet.getRange('D3:E3').setValues([['Metric', 'Amount']]).setFontWeight('bold');
  sheet.getRange('D4:E5').setValues([
    ['Income', payload.kpis.income],
    ['Spent', payload.kpis.spent]
  ]);

  // 3. Build the Expense Breakdown Pie Chart
  if (expRow > 4) {
    const pieChart = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange(`A3:B${expRow - 1}`))
      .setPosition(2, 7, 0, 0) // Positioned nicely to the right
      .setOption('title', `Expense Breakdown (${activeCycle})`)
      .setOption('is3D', true)
      .setOption('legend', {position: 'labeled'})
      .setOption('colors', ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'])
      .build();
    sheet.insertChart(pieChart);
  }

  // 4. Build the Cash Flow Column Chart
  const barChart = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange('D3:E5'))
    .setPosition(18, 7, 0, 0) // Positioned below the Pie Chart
    .setOption('title', `Cash Flow (${activeCycle})`)
    .setOption('legend', {position: 'none'})
    .setOption('vAxis', {format: 'short'})
    .setOption('colors', ['#10b981']) // Success green
    .build();
  
  sheet.insertChart(barChart);

  // 5. Hide the raw data columns for a clean look
  sheet.hideColumns(1, 5);
  sheet.setHiddenGridlines(true);
  
  SpreadsheetApp.getUi().alert('📊 Analytics Dashboard generated successfully!');
}