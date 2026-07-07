/**
 * ========================================================
 * FINANCE OS WEBHOOK
 * Handles incoming JSON from Telegram and routes all
 * transactions through the shared transaction pipeline.
 * ========================================================
 */

function doPost(e) {

  try {

    const payload = JSON.parse(e.postData.contents);

    const settings = Database.getSettings();

    //----------------------------------------------------------------------
    // 1. Parse "Description : Amount"
    //----------------------------------------------------------------------

    const rawText = payload.desc || "";
    const parts = rawText.split(":");

    const description =
      parts[0]
        ? String(parts[0].trim())
        : "Manual Entry";

    const amount =
      parts[1]
        ? Number(parts[1].trim())
        : 0;

    //----------------------------------------------------------------------
    // 2. Read incoming values
    //----------------------------------------------------------------------

    const dateObj =
      payload.date
        ? new Date(payload.date)
        : new Date();

    const cycle = String(
      payload.cycle ||
      settings["Active_Cycle"] ||
      "N/A"
    );

    const type = String(
      payload.type ||
      CONFIG.DEFAULTS.TYPE
    );

    const category = String(
      payload.cat ||
      settings["Default_Category"] ||
      CONFIG.DEFAULTS.CATEGORY
    );

    const account = String(
      payload.account ||
      settings["Default_Account"] ||
      CONFIG.DEFAULTS.ACCOUNT
    );

    const toAccount = String(
      payload.to || ""
    );

    //----------------------------------------------------------------------
    // 3. Delegate everything to the shared transaction pipeline
    //----------------------------------------------------------------------

    const result = submitNewTransaction({

      budgetCycle: cycle,

      date: dateObj,

      type: type,

      category: category,

      description: description,

      account: account,

      toAccount: toAccount,

      amount: amount,

      notes: CONFIG.DEFAULTS.TELEGRAM_NOTE

    });

    if (result.error) {
      throw new Error(result.message);
    }

    //----------------------------------------------------------------------
    // 4. Success Response
    //----------------------------------------------------------------------

    return ContentService
      .createTextOutput(
        JSON.stringify({
          status: "success",
          message: `Logged: ${description} (${amount})`
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  }

  catch (error) {

    console.error(error);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          status: "error",
          message: error.message || error.toString()
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  }

}