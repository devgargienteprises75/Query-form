// ============================================
// Google Apps Script — Employee Query Form
//
// DEPARTMENTS (merged):
// - Sales & Marketing (was: Sales, Marketing, Social Media, Market Place)
// - Purchase & Accounts (was: Purchase, Accounts)
// - Operations & Inventory (was: Operation, Inventory & Reports)
//
// SETUP:
// 1. Paste this code in Extensions → Apps Script
// 2. Select "setupAllSheets" → Click ▶ Run
//    (Grant permissions when prompted)
// 3. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the URL and paste in script.js
// ============================================

var DEPARTMENTS = [
  'Sales & Floor Incharge',
  'Purchase & Accounts',
  'Research and Development',
  'HR',
  'Operations & Inventory',
  'Customer Service',
  'Logistic',
  'Front desk',
  'Billing Team',
  'Social Media & Marketing'
];

var HEADERS = [
  'Timestamp', 'Employee Name', 'Department',
  'Query Category', 'Query Description',
  'Query Related Departments', 'Priority Level'
];

// =============================================
// RUN THIS FIRST — Creates Master + all sheets
// Select this function → Click ▶ Run
// =============================================
function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Master sheet
  createSheet(ss, 'Master');
  Logger.log('✅ Created: Master');

  // Create department sheets
  for (var i = 0; i < DEPARTMENTS.length; i++) {
    createSheet(ss, DEPARTMENTS[i]);
    Logger.log('✅ Created: ' + DEPARTMENTS[i]);
  }

  Logger.log('🎉 All sheets created successfully!');
}

// =============================================
// Creates a sheet with headers and formatting
// =============================================
function createSheet(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  // Only create if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  // Always set headers (in case sheet was empty)
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#673ab7');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 180);  // Timestamp
  sheet.setColumnWidth(2, 160);  // Name
  sheet.setColumnWidth(3, 180);  // Department
  sheet.setColumnWidth(4, 180);  // Category
  sheet.setColumnWidth(5, 300);  // Description
  sheet.setColumnWidth(6, 200);  // Related Depts
  sheet.setColumnWidth(7, 120);  // Priority

  return sheet;
}

// =============================================
// Handles form submission
// =============================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = e.parameter;

    var rowData = [
      new Date(),
      data.employeeName || '',
      data.department || '',
      data.queryCategory || '',
      data.queryDescription || '',
      data.queryRelatedDepartments || '',
      data.priorityLevel || ''
    ];

    // 1. Always save to Master
    var masterSheet = ss.getSheetByName('Master');
    if (!masterSheet) {
      masterSheet = createSheet(ss, 'Master');
    }
    masterSheet.appendRow(rowData);

    // 2. Save to department sheet
    var department = data.department || '';
    if (department) {
      var deptSheet = ss.getSheetByName(department);
      if (!deptSheet) {
        deptSheet = createSheet(ss, department);
      }
      deptSheet.appendRow(rowData);
    }

    // 3. Save to related department sheets
    var relatedDepts = data.queryRelatedDepartments || '';
    if (relatedDepts) {
      var relatedList = relatedDepts.split(', ');
      for (var i = 0; i < relatedList.length; i++) {
        var relDept = relatedList[i].trim();
        if (relDept && relDept !== department) {
          var relSheet = ss.getSheetByName(relDept);
          if (!relSheet) {
            relSheet = createSheet(ss, relDept);
          }
          relSheet.appendRow(rowData);
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Apps Script is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}
