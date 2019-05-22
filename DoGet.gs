function doGet(e) {
  // -----Query Parameters-----
  var param_year = e.parameter.year ? e.parameter.year : '2019';

  // -----Spreadsheet meta-----
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(param_year);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  // -----Get Spreadsheet Data-----
  var sheet_data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  // データの成形
  var responseList = [];
  sheet_data.map(function(d) {
    responseList.push({
      cup_title: d[0],
      matchday_no: d[1],
      team: d[2],
      home_away_flag: d[4],
      comment_halftime: d[5],
      comment_fulltime: d[6],
      match_results: d[7]
    });
  });

  // レスポンス
  var response = {
    results: responseList,
    meta: {
      status: 'success'
    }
  };
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}
