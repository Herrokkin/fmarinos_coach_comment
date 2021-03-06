function doGet(e) {
  // -----Query Parameters-----
  var param_year = e.parameter.year ? e.parameter.year : '2019';

  // -----Spreadsheet meta-----
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(param_year);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  // -----Get Spreadsheet Data-----
  var sheet_data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  // Make data for response
  var responseList = [];
  sheet_data.map(function(d) {
    responseList.push({
      cup_title: d[0],
      matchday_no: d[1],
      team_against: d[2],
      match_date: d[3],
      home_away_flag: d[4],
      comment_halftime: d[5],
      comment_fulltime: d[6],
      standings: d[7],
      points: d[8],
      win: d[9],
      draw: d[10],
      lose: d[11],
      goals_for: d[12],
      goals_against: d[13],
      goal_difference: d[14],
      match_result: d[15],
      match_goals_for: d[16],
      match_goals_against: d[17]
    });
  });

  var response = {
    results: responseList,
    meta: {
      status: 'success'
    }
  };
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}
