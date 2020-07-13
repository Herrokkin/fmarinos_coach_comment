# coding:utf-8

import MeCab
import math
import requests
import json
import urllib2
import mojimoji

# -----BEGIN TF-IDF-----
# http://pgt.hatenablog.jp/entry/2014/08/04/174123


def calc_tfidf(sentence, team_against, home_away_flag, match_result):
    # -----BEGIN Stop words-----
    # src(1) http://testpy.hatenablog.com/entry/2016/10/05/004949
    # src(2) https://www.japannetbank.co.jp/jnb_toto/team_list.html
    slothlib_path = 'http://svn.sourceforge.jp/svnroot/slothlib/CSharp/Version1/SlothLib/NLP/Filter/StopWord/word/Japanese.txt'
    slothlib_file = urllib2.urlopen(slothlib_path)
    slothlib_stopwords = [line.decode('utf-8').strip()
                          for line in slothlib_file]
    slothlib_stopwords = [ss for ss in slothlib_stopwords if not ss == u'']

    my_stopwords = ['ヴィッセル神戸', '神戸', 'ヴィッセル', '浦和レッズ', '浦和', 'レッズ', 'ＦＣ東京', 'Ｆ東京', '東京', '大分トリニータ', '大分', 'トリニータ',
                    '鹿島アントラーズ', '鹿島', 'アントラーズ', '川崎フロンターレ', '川崎', 'フロンターレ', 'ガンバ大阪', 'Ｇ大阪', 'ガンバ', 'Ｇ', '大阪',
                    'サガン鳥栖', '鳥栖', 'サガン', 'サンフレッチェ広島', '広島', 'サンフレッチェ', '清水エスパルス', '清水', 'エスパルス', 'ジュビロ磐田', '磐田', 'ジュビロ',
                    '湘南ベルマーレ', '湘南', 'ベルマーレ', 'セレッソ大阪', 'Ｃ大阪', 'セレッソ', 'Ｃ', '大阪', '名古屋グランパス', '名古屋', 'グランパス',
                    'ベガルタ仙台', '仙台', 'ベガルタ', '北海道コンサドーレ札幌', '札幌', 'コンサドーレ', '松本山雅ＦＣ', '松本', '山雅',
                    '横浜F・マリノス', '横浜Ｍ', 'Ｆ', 'マリノス']

    slothlib_stopwords.extend(word.decode('utf-8')
                              for word in my_stopwords)  # my_stopwordsをutf-8化して追加
    # -----END Stop words-----

    num = len(sentence)
    result = []
    result_node = []
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

    for i in range(num):  # 文章の分解
        tagger = MeCab.Tagger()
        result.append(tagger.parse(sentence[i]))

    for i in range(num):
        word = result[i].split()[:-1:2]  # 単語
        feature = result[i].split()[1:-1:2]  # 特徴(カンマ区切り)
        word_to_remove = []  # 削除単語リスト

        for j, feature_value in enumerate(feature):
            pos = feature_value.split(',')[0]  # 品詞抽出

            # 指定した名詞以外を削除単語リスト(word_to_remove)へ格納
            if pos not in ["名詞", "動詞", "形容詞"]:
                word_to_remove.append(word[j])

        for k in word_to_remove:  # 削除リスト(word_to_remove)の単語を、wordから削除
            word.remove(k)

        wordList.append(word)  # wordListに分解された単語要素のみを格納

    for i in range(num):
        for word in wordList[i]:
            if word.decode('utf-8') not in slothlib_stopwords:  # リストからストップワードを削除
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
            if count_in_i < 10:  # 1節あたりn件のワードを抽出
                print str(i + 1).zfill(2) + ', ' + team_against[i] + ', ' + home_away_flag[i] + ', ' + match_result[i] + ', ' + word + ', ' + str(round(count, 3))
                count_in_i += 1
# -----END TF-IDF-----


if __name__ == '__main__':
    # -----Google Spreadsheetに保存した監督コメント取得-----
    year = 2020
    url = 'https://script.google.com/macros/s/AKfycbz3HCPGAaRk1fjBjgeJzUjTNwh8uW8MguJNM11VbSM1bVgEQAk/exec?year=' + \
        str(year)
    response = requests.get(url)
    data = response.text
    json_data = json.loads(data)
    json_data = json_data['results']

    # sentenceにコメント格納
    sentence = []
    for match in json_data:
        # 文書を全角へ変換 https://qiita.com/chamao/items/7edaba62b120a660657e
        sentence_fullbyte = mojimoji.han_to_zen(match['comment_fulltime'])
        sentence.append(sentence_fullbyte.encode('utf-8'))

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
