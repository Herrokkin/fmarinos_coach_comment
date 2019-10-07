# coding:utf-8

import MeCab
import math
import requests
import json

# -----BEGIN TF-IDF-----
# http://pgt.hatenablog.jp/entry/2014/08/04/174123


def calc_tfidf(sentence, team_against, home_away_flag, match_result):
    num = len(sentence)
    result = []

    for i in range(num):  # 文章の分解
        tagger = MeCab.Tagger()
        result.append(tagger.parse(sentence[i]))

    wordCount = {}
    allCount = {}
    sub_tfstore = {}
    tfcounter = {}
    tfstore = {}
    sub_idf = {}
    idfstore = {}
    merge_idf = {}
    tfidf = {}
    merge_tfidf = {}
    wordList = []
    sum = 0

    for i in range(num):
        wordList.append(result[i].split()[:-1:2])  # wordListに分解された単語要素のみを格納

    for i in range(num):
        for word in wordList[i]:
            allCount[i] = wordCount.setdefault(word, 0)
            wordCount[word] += 1
        allCount[i] = wordCount  # 単語出現回数を文章ごとに格納。tfの分母に相当
        wordCount = {}

    for i in range(num):  # tfの分母を計算
        for word in allCount[i]:
            sum = sum + allCount[i][word]
        sub_tfstore[i] = sum
        sum = 0

    for i in range(num):  # tf値を計算し文章ごとに辞書に格納
        for word in allCount[i]:
            tfcounter[word] = allCount[i][word] * 1.0 / sub_tfstore[i]
        tfstore[i] = tfcounter
        tfcounter = {}

    for i in range(num):
        for word in wordList[i]:
            wordCount.setdefault(word, 0)
        for word in allCount[i]:
            wordCount[word] += 1
        sub_idf = wordCount  # ある単語の文章あたりの出現回数を辞書に格納

    for i in range(num):
        for word in allCount[i]:
            idfstore[word] = math.log(
                1.0 * math.fabs(num) / math.fabs(sub_idf[word]))
        merge_idf[i] = idfstore
        idfstore = {}

    for i in range(num):  # tfidfの計算
        for word in allCount[i]:
            tfidf[word] = tfstore[i][word] * merge_idf[i][word]
        merge_tfidf[i] = tfidf
        tfidf = {}

    print 'Matchday#, Team_Against, Home_Away, Match_Result, Word, TF-IDF'

    for i in range(num):  # tfidf降順に出力
        count_in_i = 0
        for word, count in sorted(merge_tfidf[i].items(), key=lambda x: x[1], reverse=True):
            if count_in_i < 5:  # 1節あたりn件のワードを抽出
                print str(i + 1).zfill(2) + ', ' + team_against[i] + ', ' + home_away_flag[i] + ', ' + match_result[i] + ', ' + word + ', ' + str(round(count, 3))
                count_in_i += 1
# -----END TF-IDF-----


if __name__ == '__main__':
    # -----Google Spreadsheetに保存した監督コメント取得-----
    year = 2019
    url = 'https://script.google.com/macros/s/AKfycbz3HCPGAaRk1fjBjgeJzUjTNwh8uW8MguJNM11VbSM1bVgEQAk/exec?year=' + str(year)
    response = requests.get(url)
    data = response.text
    json_data = json.loads(data)
    json_data = json_data['results']

    # sentenceにコメント格納
    sentence = []
    for match in json_data:
        sentence.append(match['comment_fulltime'].encode('utf-8'))

    # その他試合情報を格納
    team_against = []
    for match in json_data:
        team_against.append(match['team_against'].encode('utf-8'))

    home_away_flag = []
    for match in json_data:
        home_away_flag.append(match['home_away_flag'].encode('utf-8'))

    match_result = []
    for match in json_data:
        match_result.append(match['match_result'].encode('utf-8'))

    # print(json.dumps(sentence, ensure_ascii=False))
    calc_tfidf(sentence, team_against, home_away_flag, match_result)
