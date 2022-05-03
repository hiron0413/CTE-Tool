var chars = "";
var charsets = {
    number: "0123456789", 
    uppercaseAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercaseAlphabet: "abcdefghijklmnopqrstuvwxyz",
    symbol1: ".,:;!?|#$%&()-=^~+*@_<>{}[]()\"'\\/",
    symbol2: "€§±×÷",
    hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょ",
    katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッャュョヴ",
    kanji1: ""
}
var checked = [];

function checkboxClicked(name) {
    if (name in checked) {
        
    } else {
        checked.push(charsets[name])
    }
};