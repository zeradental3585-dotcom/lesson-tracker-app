/**
 * Daily Lesson & Attendance Tracker — Google Apps Script backend
 * -----------------------------------------------------------------------
 * Free backend for the school.zeratech.io lesson tracker pilot.
 * This script is bound to a Google Sheet and deployed as a Web App.
 * It exposes:
 *   GET  ?action=config   -> teachers / classes / periods / subjects lists
 *   GET  ?action=data     -> all entries (for the principal dashboard)
 *   POST { ...entry }     -> appends one lesson/attendance entry
 *
 * See README.md for one-time setup + deployment steps.
 */

var SHEET_ENTRIES = 'Entries';
var SHEET_SETUP = 'Setup';

// ---------------------------------------------------------------------
// One-time setup: run this once from the Apps Script editor
// (select setupSheets in the toolbar and click Run) before deploying.
// It creates both tabs with headers and a few example rows so the
// dropdowns aren't empty on day one.
// ---------------------------------------------------------------------
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var entries = ss.getSheetByName(SHEET_ENTRIES) || ss.insertSheet(SHEET_ENTRIES);
  entries.clear();
  entries.appendRow([
    'Timestamp', 'Date', 'Teacher', 'Class', 'Section', 'Period',
    'Subject', 'Topic Taught', 'Present', 'Absent', 'Total', 'Remarks'
  ]);
  entries.setFrozenRows(1);

  var setup = ss.getSheetByName(SHEET_SETUP) || ss.insertSheet(SHEET_SETUP);
  setup.clear();
  setup.appendRow(['Teachers', 'Classes', 'Sections', 'Periods', 'Subjects', 'SchoolName']);
  setup.appendRow(['e.g. Mrs. Sharma', 'e.g. Grade 6', 'e.g. A', '1', 'e.g. Mathematics', 'Your School Name']);
  setup.appendRow(['e.g. Mr. Khan', 'e.g. Grade 7', 'e.g. B', '2', 'e.g. Science', '']);
  setup.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(
    'Setup complete. Now edit the "Setup" tab: replace the example rows with your real ' +
    'teacher names, classes, sections, periods and subjects (one value per row, per column — ' +
    'columns do not need to be the same length). Then deploy this script as a Web App.'
  );
}

// ---------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'config';
  var out;
  if (action === 'data') {
    out = getEntries_();
  } else {
    out = getConfig_();
  }
  return jsonOut_(out);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var result = addEntry_(body);
    return jsonOut_(result);
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ---------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------
function getConfig_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SETUP);
  if (!sheet) return { ok: false, error: 'Setup sheet not found. Run setupSheets() first.' };

  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var columns = {};
  headers.forEach(function (header, colIndex) {
    var key = String(header).trim();
    if (!key) return;
    var list = [];
    values.forEach(function (row) {
      var v = row[colIndex];
      if (v !== '' && v !== null && v !== undefined) list.push(String(v).trim());
    });
    columns[key] = list;
  });

  return {
    ok: true,
    teachers: columns['Teachers'] || [],
    classes: columns['Classes'] || [],
    sections: columns['Sections'] || [],
    periods: columns['Periods'] || [],
    subjects: columns['Subjects'] || [],
    schoolName: (columns['SchoolName'] && columns['SchoolName'][0]) || 'Your School'
  };
}

function getEntries_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRIES);
  if (!sheet) return { ok: false, error: 'Entries sheet not found. Run setupSheets() first.' };

  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var rows = values.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      var key = String(header).trim();
      var val = row[i];
      if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      obj[key] = val;
    });
    return obj;
  });

  return { ok: true, entries: rows };
}

function addEntry_(body) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRIES);
  if (!sheet) return { ok: false, error: 'Entries sheet not found. Run setupSheets() first.' };

  var present = Number(body.present) || 0;
  var absent = Number(body.absent) || 0;
  var total = body.total ? Number(body.total) : present + absent;

  sheet.appendRow([
    new Date(),                 // Timestamp
    body.date || '',            // Date (yyyy-MM-dd from the form)
    body.teacher || '',
    body.className || '',
    body.section || '',
    body.period || '',
    body.subject || '',
    body.topic || '',
    present,
    absent,
    total,
    body.remarks || ''
  ]);

  return { ok: true };
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
