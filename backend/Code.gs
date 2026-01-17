// --- GOOGLE APPS SCRIPT BACKEND ---
// Copy this code into your Google Sheet's Script Editor (Extensions > Apps Script)

function doPost(e) {
  // 1. Lock to prevent concurrent editing issues
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10 seconds for other processes to finish

  try {
    // 2. Get the Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    // 3. Parse the incoming JSON data
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);

    // 4. Prepare the row data
    // Schema: [Timestamp, Name, Phone, GuestCount, SelectedEvents, Diet]
    const timestamp = new Date();
    const row = [
      timestamp,
      data.name,
      data.phone || '',
      data.guestCount,
      data.events, // Comma-separated string of event titles
      data.diet
    ];

    // 5. Append to Sheet
    sheet.appendRow(row);

    // 6. Return JSON Success
    // Note: 'no-cors' in frontend means the browser won't read this, but it ensures 200 OK.
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Handle Errors
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    // 7. Release Lock
    lock.releaseLock();
  }
}

// Optional: Setup function to create headers if sheet is empty
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Guest Name", "Phone", "Guest Count", "Selected Events", "Dietary Preference"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
  }
}