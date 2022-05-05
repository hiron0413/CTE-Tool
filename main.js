var chars = " ";
var charsets = {
    number: "0123456789", 
    uppercaseAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercaseAlphabet: "abcdefghijklmnopqrstuvwxyz",
    symbol1: ".,:;!?|#$%&()-=^~+*@_<>{}[]()\"'\\/",
    symbol2: "€§±×÷",
    hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょ",
    katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッャュョヴ",
    kanji1: ""
};
var checked = [];

function options(){
    $("input[name=option]:checked").each(function(){
        $("#option-" + $(this).val()).css({
            "color":"#00da98", "font-weight":500, "border-color": "#00da98"
        });
    });

    $("input[name=option]:not(:checked)").each(function(){
        $("#option-" + $(this).val()).css({
            "color":"#c6dfd7", "font-weight":500, "border-color": "#c6dfd7"
        });
    });
};

$(function(){
    options();

    $("#uploadFont").on("change", function(){
        var font_file = $("#uploadFont").prop('files')[0];
        $("#fontFile").text(font_file.name);
    });

    $("input[name=charset]").on("change", function(){
        chars = " ";
        $("input[name=charset]:checked").each(function(){
            chars += charsets[$(this).val()];
        });
        $("#chars").val(chars);
    });

    $("input[name=option]").on("change", function(){
        options();
    });
});

