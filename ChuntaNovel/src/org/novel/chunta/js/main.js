// --------------------------------------------------
// 設定値
// カスタマイズしたい場合はここの値を変更してください。
// --------------------------------------------------
// タイトル
var PROP_TITLE = "Chunta Novel ver1.0";
// 画像の横幅
var PROP_WIDTH_IMG = "200px";
// テキストウインドウの縦幅
var PROP_HEIGHT_WINDOW = "100px";
// 全体の背景色
// 色の種類は"html 色"でgoogle等で検索してください。
var PROP_BG_COLOR = "papayawhip";
// テキストウインドウ背景色
var PROP_WINDOW_COLOR = "seashell";
// backボタンの背景色
var PROP_BTN_BACK_COLOR = "violet";
// nextボタンの背景色
var PROP_BTN_NEXT_COLOR = "violet";
// シナリオ終了文言
var PROP_TXT_END = "以上で終了です。閲覧ありがとうございました。";
// 初期画像の画像URL "../img/ファイル名"としてください。
var PROP_URL_DEFAULT_IMG = "../img/1.jpg";
// 初期テキストのhtmlタグ
var PROP_TXT_FIRST = "Chunta Novelのサンプルです。";
// タイプ速度 0に近いほど早い
var PROP_SPEED_TYPE = 30;
// カットイン画像表示時間 ミリ秒
var PROP_TIME_CUTIN = 1000;


// --------------------------------------------------
// STATIC
// よく分からない場合はできるだけ変更しないでください。
// --------------------------------------------------
// 区切り文字
var STR_SPRIT = '[n]';
// 画像パターン（正規表現）
var PTN_IMG = "\\[i\\]";
// 画像正規表現オブジェクト
var REG_IMG = new RegExp(PTN_IMG, "i");
// シナリオテキスト
var FILE_TXT = "../txt/sinario.txt";
// シナリオ表示場所のhtmlid
var ID_TXT = "textData";
// 画像表示場所のhtmlid
var ID_IMG = "imgData";
// backボタンのhtmlid
var ID_BACK = "backBtn";
// nextボタンのhtmlid
var ID_NEXT = "nextBtn";
// 現在ページ数表示場所のhtmlid
var ID_CURRENT_ROW = "currentRow";
// 透明度の増減の間隔
var OPA_COUNT = 2;
// 透明度の増減幅
var OPA_WIDTH = 100;
// フェードインの実行間隔　ミリ秒
var TIMER_INTERVAL = 25;
// カットイン画像パターン（正規表現）
var PTN_IMG_CUTIN = "\\[c\\]";
// カットイン画像正規表現オブジェクト
var REG_IMG_CUTIN = new RegExp(PTN_IMG_CUTIN, "i");
// brタグ
var HTMLTAG_BR = "<br />";
// 音楽インスタンスの添え字
var INDEX_AUDIO = 0;
// 音楽とマッピングしているテキスト行数
var INDEX_TEXT_ROW = 1;
// 音楽パターン（正規表現）
var PTN_AUDIO = "\\[a\\]";
// 音楽正規表現オブジェクト
var REG_AUDIO = new RegExp(PTN_AUDIO, "i");


// --------------------------------------------------
// global
// --------------------------------------------------
// 出力行
var row;
// 最大出力行
var rowMax;
// テキストの配列
var textArray = [];
// カットインから戻るときの画像
var returnImg = "";

// --------------------
// タイピング処理用
// --------------------
// タイプ文字列
var typeStr = "";
// タイプ位置
var typeIndex = 0;
// brタグを除いた各行の文字列の配列
var rowStrLengthArray = [];
// brタグのカウント -1は存在なし
var countBr = -1;

// --------------------
// 音楽用
// --------------------
var audioInfo = [];


// --------------------------------------------------
// method
// --------------------------------------------------

// --------------------
// 初期化処理
// --------------------
function init() {
    row = 0;

    // 読み込んだテキストを区切り文字ごとに分けて配列に格納
    textArray = readFileToString(FILE_TXT).split(STR_SPRIT);
    rowMax = textArray.length;

    // あらかじめ音楽ファイルを読み込んでおく
    initAudioInfo(rowMax);
    getAudioInfo(textArray);
    
    setProperty();
}

// --------------------
// nextpageボタン押下時の処理
// --------------------
function nextpage() {
    if (row >= (rowMax - 1)) {
        // 全てのシナリオの読み込みが終了していたら終了テキストを出力
        document.getElementById(ID_TXT).innerHTML = PROP_TXT_END;
        return 0;
    }

    row = row + 1;
    output(row);
}

// --------------------
// backpageボタン押下時の処理
// --------------------
function backpage() {
    if (row === 0) {
        // 一番初めの行の場合は何もしない
        return 0;
    }

    row = row - 1;
    outputLast(row);
}

// --------------------
// 画像、テキスト、ページ数を出力
// --------------------
function output(currentRow) {
    if (textArray[currentRow].match(REG_IMG)) {
        // [i] 画像
        outputImgFadein(currentRow);
    } else if (textArray[currentRow].match(REG_IMG_CUTIN)) {
        // [c] カットイン画像
        // 現在の画像を保存しカットイン画像を表示後、一定時間後に保存した画像を再表示する
        setReturnImg();
        outputCutinImg(currentRow);
        setTimeout("outputReturnImg()", PROP_TIME_CUTIN);
    } else if (textArray[currentRow].match(REG_AUDIO)) {
        // [a] 音楽
        playAudio(currentRow);
    } else {
        outputTxt(currentRow);
    }

    outputRow(currentRow);
}

// --------------------
// 最新の画像、テキスト、ページ数を出力
// カットイン画像は表示しない
// --------------------
function outputLast(currentRow) {
    outputLastImg(currentRow);
    outputLastTxt(currentRow);
    outputRow(currentRow);
}

// --------------------
// 最新のテキストを表示
// 最新のテキストが存在しない場合、初期テキストを表示
// --------------------
function outputLastTxt(currentRow) {
    for (var i = currentRow; i >= 0; i--) {
        if ( (!textArray[i].match(REG_IMG)) && (!textArray[i].match(REG_IMG_CUTIN)) && (!textArray[i].match(REG_AUDIO))) {
            // 画像 [i]にもカットイン画像 [c]にも音楽 [a]にもマッチしない場合
            outputTxt(i);
            return 0;
        }
    }

    outputFirstTxt();
}

// --------------------
// 最新の画像をフェードインなしで表示
// 最新の画像が存在しない場合、初期画像を表示
// --------------------
function outputLastImg(currentRow) {
    for (var i = currentRow; i >= 0; i--) {
        if (textArray[i].match(REG_IMG)) {
            outputImgNotFadein(i);
            return 0;
        }
    }

    outputDefaultImg();
}

// -------------------
// 画像出力
// --------------------
function outputImgFadein(currentRow) {
    document.getElementById(ID_IMG).src = textArray[currentRow].replace(REG_IMG, "");
    fadeinImg(0);
}

// -------------------
// 画像出力
// フェードインなし
// --------------------
function outputImgNotFadein(currentRow) {
    document.getElementById(ID_IMG).src = textArray[currentRow].replace(REG_IMG, "");
}

// -------------------
// デフォルト画像を出力
// --------------------
function outputDefaultImg() {
    document.getElementById(ID_IMG).src = PROP_URL_DEFAULT_IMG;
}

// -------------------
// テキスト出力
// --------------------
function outputTxt(currentRow) {
    type1strPre(exchangeBr(textArray[currentRow]));
    type1str();
}

// -------------------
// 初期テキストを出力
// --------------------
function outputFirstTxt() {
    document.getElementById(ID_TXT).innerHTML = PROP_TXT_FIRST;
}

// -------------------
// 行出力
// --------------------
function outputRow(currentRow) {
    document.getElementById(ID_CURRENT_ROW).innerText = currentRow;
}

// -------------------
// 画像をフェードイン
// --------------------
function fadeinImg(opa){
    if (opa <= OPA_WIDTH){
            document.getElementById(ID_IMG).style.filter = "alpha(opacity:"+ opa +")"; // IE用
            document.getElementById(ID_IMG).style.opacity = opa / OPA_WIDTH; // Firefox用
            opa += OPA_COUNT;
            setTimeout("fadeinImg("+ opa +")", TIMER_INTERVAL);
    }
}

// --------------------
// 改行コードをbrタグに変換する
// はじめの改行コードは空文字に変換する
// --------------------
function exchangeBr(txt) {
    // 初回の改行コードのみ空文字に置換する
    var str = txt.replace(/\r?\n/, "");
    return str.replace(/\r?\n/g, HTMLTAG_BR);
}

// --------------------
// ファイル読み込み
// --------------------
function readFileToString(fileName) {
    var xmlHttp;
    if (isBrowserIE()) {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = null;
    }
    if (xmlHttp === null) return "";

    // fileNameのテキストファイルを読み込み（同期）
    var str = "";
    try {
        xmlHttp.open("GET", fileName, false);
        xmlHttp.send(null);
        str = xmlHttp.responseText;
    } catch(e) {
        window.alert(e);
    }

    return str;
}

// --------------------
// ブラウザがIEか判定
// --------------------
function isBrowserIE() {
    var userAgent  = window.navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('msie') !== -1) {
        return true;
    } else if (userAgent.indexOf('trident/7') !== -1) {
        return true;
    }
    return false;
}

// --------------------
// キーイベントを設定
// 右矢印押下時および左ボタン押下時を設定
// --------------------
document.onkeydown = function(e) {
    switch(e.keyCode) {
        case 39:
            // 右ボタン押下時
            nextpage();
            break;
        case 37:
            // 左ボタン押下時
            backpage();
            break;
        default:
            // 何もしない
    }
};

// --------------------
// 設定値を設定する
// --------------------
function setProperty() {
    document.title = PROP_TITLE;
    document.body.style.backgroundColor = PROP_BG_COLOR;
    document.getElementById(ID_TXT).style.backgroundColor = PROP_WINDOW_COLOR;
    document.getElementById(ID_TXT).style.height = PROP_HEIGHT_WINDOW;
    document.getElementById(ID_IMG).style.width = PROP_WIDTH_IMG;
    document.getElementById(ID_BACK).style.backgroundColor = PROP_BTN_BACK_COLOR;
    document.getElementById(ID_NEXT).style.backgroundColor = PROP_BTN_NEXT_COLOR;
}

// --------------------
// 1文字タイプの前処理を実施する
// --------------------
function type1strPre(str) {
    // タイプ用のグローバル変数を初期化
    typeStr = "";
    typeIndex = 0;
    rowStrLengthArray = [];
    countBr = -1;

    // タイプ文字列を設定
    typeStr = str;

    // brタグごとに分割して各行の文字列長を取得
    var typeArray = str.split(HTMLTAG_BR);
    for (var i = 0; i < typeArray.length; i++) {
        rowStrLengthArray[i] = typeArray[i].length;
    }
    
    // brタグが存在する場合、brタグカウントを0に設定
    if (typeArray.length > 0) {
        countBr = 0;
    }
}

// --------------------
// 1文字タイプ処理
// setTimeoutで複数回実行される
// --------------------
function type1str() {
    var type = "";

    // タイプする位置がbrタグの開始位置である場合、タイプ位置をbrタグ分進める
    if ( (countBr !== -1) && (countBr < rowStrLengthArray.length) && (typeIndex === rowStrLengthArray[countBr]) ) {
        typeIndex = typeIndex + HTMLTAG_BR.length;
        countBr++;
    }

    // 1文字ずつタイプする
    type = typeStr.substring(0, typeIndex);
    document.getElementById(ID_TXT).innerHTML = type;
    typeIndex++;

    var rep = setTimeout("type1str()", PROP_SPEED_TYPE); 

    if (typeIndex > typeStr.length) {
        clearTimeout(rep);
    }
}

// --------------------
// カットインから戻るときの画像を設定する
// --------------------
function setReturnImg() {
    returnImg = document.getElementById(ID_IMG).src;
}

// --------------------
// カットインから戻るときの画像を表示する
// --------------------
function outputReturnImg() {
    document.getElementById(ID_IMG).src = returnImg;
    fadeinImg(0);
}

// --------------------
// カットイン画像を表示する
// --------------------
function outputCutinImg(currentRow) {
    document.getElementById(ID_IMG).src = textArray[currentRow].replace(REG_IMG_CUTIN, "");
}

// ----------
// テキストからすべての音楽情報を取得
// ----------
function getAudioInfo(textArray) {
    var audioNum = 0;
    
    for (var row = 0;row < textArray.length; row++) {
        if (textArray[row].match(REG_AUDIO)) {
            audioInfo[audioNum][INDEX_AUDIO] = new Audio(textArray[row].replace(REG_AUDIO, ""));
            audioInfo[audioNum][INDEX_TEXT_ROW] = row;
            audioNum++;
        }
    }
    
    return audioInfo;
}

// -------------------
// 音楽ファイルの再生
// --------------------
function playAudio(currentRow) {
    for (var audioNum = 0;audioNum < audioInfo.length; audioNum++) {
        if (audioInfo[audioNum][INDEX_TEXT_ROW] === currentRow) {
            audioInfo[audioNum][INDEX_AUDIO].play();
            break;
        }
    }
}

// --------------------
// 音楽情報初期化
// 二次元配列化する
// --------------------
function initAudioInfo(rowMax) {
    for (var audioNum = 0;audioNum < rowMax; audioNum++) {
        audioInfo[audioNum] = new Array();
    }
}
