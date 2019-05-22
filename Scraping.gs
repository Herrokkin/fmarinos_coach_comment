function scrapingTrigger() {
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

      // GameInfo情報取得
      // 試合日・スタジアム
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

function replaceAll(str, beforeStr, afterStr) {
  var reg = new RegExp(beforeStr, "g");
  return str.replace(reg, afterStr);
}
