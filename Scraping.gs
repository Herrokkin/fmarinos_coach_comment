function scrapingFmarinos() {
  // -----Spreadsheet meta-----
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  // -----Get Spreadsheet Data-----
  var sheet_data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  // -----試合毎にScraping実施-----
  for (var i_sheet = 2; i_sheet <= lastRow; i_sheet++) {
    try {
      // -----matchMasterSheetデータ取得-----
      var match_date = sheet.getRange(i_sheet, 4).getValue();
      var url_fmarinos = 'https://www.f-marinos.com/match/report' + match_date;

      // -----Scraping_JLeagueTicket-----
      var html_fmarinos = UrlFetchApp.fetch(url_fmarinos).getContentText();
      // Parser: from().to()はfromとtoに挟まれた部分を抜き出します。build()で文字列、iterate()で文字列の配列が得られます。

      var html_coach_comment = Parser.data(html_fmarinos)
        .from('<p class="txt">')
        .to('</p>')
        .iterate();

      var html_coach_comment_halftime = html_coach_comment[1];
      html_coach_comment_halftime = replaceAll(html_coach_comment_halftime, '<br>', '');
      html_coach_comment_halftime = replaceAll(html_coach_comment_halftime, '\n', '');
      html_coach_comment_halftime = replaceAll(html_coach_comment_halftime, '\r', '');
      html_coach_comment_halftime = replaceAll(html_coach_comment_halftime, ' ', '');

      var html_coach_comment_fulltime = html_coach_comment[3];
      html_coach_comment_fulltime = replaceAll(html_coach_comment_fulltime, '<br>', '');
      html_coach_comment_fulltime = replaceAll(html_coach_comment_fulltime, '\n', '');
      html_coach_comment_fulltime = replaceAll(html_coach_comment_fulltime, '\r', '');
      html_coach_comment_fulltime = replaceAll(html_coach_comment_fulltime, ' ', '');


      sheet.getRange(i_sheet, 6).setValue(html_coach_comment_halftime);
      sheet.getRange(i_sheet, 7).setValue(html_coach_comment_fulltime);

    } catch (e) {
      Logger.log('[Error] ' + e);
    }
  }
}

function scrapingJLagueStandings() {
  // -----Spreadsheet meta-----
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  // -----Get Spreadsheet Data-----
  var sheet_data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  // -----試合毎にScraping実施-----
  for (var i_sheet = 2; i_sheet <= lastRow; i_sheet++) {
    try {
      // -----matchMasterSheetデータ取得-----
      var match_day_no = sheet.getRange(i_sheet, 2).getValue();
      var url_jleague = 'https://data.j-league.or.jp/SFRT01/?yearId=2019&competitionId=460&competitionSectionId=' + match_day_no + '&search=search';

      // -----Scraping_JLeagueTicket-----
      var html_jleague_standings = UrlFetchApp.fetch(url_jleague).getContentText();
      // Parser: from().to()はfromとtoに挟まれた部分を抜き出します。build()で文字列、iterate()で文字列の配列が得られます。

      var html_jleague_standings_row = Parser.data(html_jleague_standings)
        .from('<tr style="background-color:">')
        .to('</tr>')
        .iterate();

      var teamname, standings, points, win, draw, lose, goals_for, goals_against;
      for (var i_jleague_standings_row = 0; i_jleague_standings_row < html_jleague_standings_row.length; i_jleague_standings_row++) {
        teamname = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
          .from('<td class="wd02">')
          .to('</td>')
          .build();

        if (teamname.indexOf('横浜Ｆ・マリノス') !== -1) {
          standings = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd01" data-sort-value="')
            .to('">')
            .build();

          points = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd03" data-sort-value="')
            .to('">')
            .build();

          win = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd05" data-sort-value="')
            .to('">')
            .build();

          draw = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd08" data-sort-value="')
            .to('">')
            .build();

          lose = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd09" data-sort-value="')
            .to('">')
            .build();

          goals_for = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd12" data-sort-value="')
            .to('">')
            .build();

          goals_against = Parser.data(html_jleague_standings_row[i_jleague_standings_row])
            .from('<td class="wd13" data-sort-value="')
            .to('">')
            .build();

          sheet.getRange(i_sheet, 8).setValue(standings);
          sheet.getRange(i_sheet, 9).setValue(points);
          sheet.getRange(i_sheet, 10).setValue(win);
          sheet.getRange(i_sheet, 11).setValue(draw);
          sheet.getRange(i_sheet, 12).setValue(lose);
          sheet.getRange(i_sheet, 13).setValue(goals_for);
          sheet.getRange(i_sheet, 14).setValue(goals_against);
        }
      }

    } catch (e) {
      Logger.log('[Error] ' + e);
    }
  }
}

function replaceAll(str, beforeStr, afterStr) {
  var reg = new RegExp(beforeStr, "g");
  return str.replace(reg, afterStr);
}
