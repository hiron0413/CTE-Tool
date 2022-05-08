var chars = " ";
const charsets = {
    number: "0123456789", 
    uppercaseAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercaseAlphabet: "abcdefghijklmnopqrstuvwxyz",
    symbol1: ".,:;!?|#$%&()-=^~+*@_<>{}[]()\"'\\/",
    symbol2: "€§±×÷",
    hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょ",
    katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッャュョヴ",
    kanji1: ""
};
const replace = {".": "-dot", "/": "-slash"}
const type = { ".zip": "blob", ".txt": "text/plain" }
var options = { "rect": true, "replace": true }
var checked = [];
var font = {};
var font_name = "";
var font_size = 100;
var data = {};

class FontTools {
    getBoundingBox(font, char, size) {
        return font.getPath(char, 0, 0, size).getBoundingBox();
    };

    getWidth(font, char, size) {
        return font.getAdvanceWidth(char, size);
    };

    getKerning(font, char1, char2, size) {
        return font.getKerningValue(font.charToGlyph(char1), font.charToGlyph(char2)) * size / 1000;
    };

    toPath(font, char, size) {
        return font.getPath(char, 240, 180, size).toPathData(3);
    };

    toSVG(font, char, size, color="#ff0000") {
        const path = this.toPath(font, char, size);
        return `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="480" height="360" fill-opacity="0"/><path fill="${color}" d="${path}"/></svg>`;
    };

    getMaxMin(font, chars, size) {
        var yMaxList = [0];
        var yMinList = [0];
        var xMaxList = [0];
        var xMinList = [0];
        var box = {};
        chars.forEach(char => {
            box = this.getBoundingBox(font, char, size);
            yMaxList.push(box.y2);
            yMinList.push(box.y1);
            xMaxList.push(box.x2);
            xMinList.push(box.x1);
        });

        return {
            "xMax": Math.max.apply(null,xMaxList),
            "xMin": Math.min.apply(null,xMinList),
            "yMax": Math.max.apply(null,yMaxList),
            "yMin": Math.min.apply(null,yMinList)
        };
    };

    getData(font, chars, size, color="#ff0000") {
        var SVGText = [];
        var width = [];
        var kerning = [];

        chars.forEach(char => {
            SVGText.push(this.toSVG(font, char, size, color));
            width.push(this.getWidth(font, char, size));
            chars.forEach(char2 => {
                kerning.push(this.getKerning(font, char, char2, size));
            });
        });

        return { "SVGText":SVGText, "width":width, "kerning":kerning };
    };
};

function options(){
    $("input[name=option]:checked").each(function(){
        $("#option-" + $(this).val()).css({
            "color":"#00da98", "font-weight":500, "border-color": "#00da98"
        });
        options[$(this).val()] = true;
    });

    $("input[name=option]:not(:checked)").each(function(){
        $("#option-" + $(this).val()).css({
            "color":"#c6dfd7", "font-weight":500, "border-color": "#c6dfd7"
        });
        options[$(this).val()] = false;
    });
};

function openFont(file) {
    var reader = new FileReader();
    reader.onload = function() {
        font = opentype.parse(reader.result);
        font_name = font.names.fullName.en;
        setFontSize()
    };

    reader.readAsArrayBuffer(file)
};

function setFontSize() {
    const maxMin = fontTools.getMaxMin(font, chars.split(""), 100);
    font_size = 0.9 * 100 / Math.max(
        maxMin.xMax / 240, 
        maxMin.xMin / -240, 
        maxMin.yMax / 180, 
        maxMin.yMin / -180,
        1E-3
        );
};

function downloadAsZip(data) {
    var zip = new JSZip();
    zip.file("width.txt", data.width.join("\n"));
    zip.file("kerning.txt", data.kerning.join("\n"));
    var svg = zip.folder("svg");
    if (options["replace"]) {
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] in replace) {
                svg.file(replace[chars[i]] + ".svg", data.SVGText[i], {binary: false});
            } else {
                svg.file(chars[i] + ".svg", data.SVGText[i], {binary: false});
            };
        };
    } else {
        for (let i = 0; i < chars.length; i++) {
            svg.file(chars[i] + ".svg", data.SVGText[i], {binary: false});
        };
    };
        
    zip.generateAsync({type:"base64"})
    .then(function(content) {
        download(content, ".zip");
        //saveAs(content, font_name + ".zip");
    });
};

function downloadAsTxt(data) {
    var txt = [];
    txt.push(data.SVGText.join("\n"));
    txt.push(data.width.join("\n"));
    txt.push(data.kerning.join("\n"));
    txt = txt.join("\n-----\n");
    download(txt, ".txt");
};

function download(data, file_type) {
    if (file_type === ".zip") {
        var uri = "data:application/zip;base64," + data;
    } else {
        const blob = new Blob([data],{ type: type[file_type] });
        var uri = URL.createObjectURL(blob)
    }
    var a = document.createElement("a");
    a.download = font_name + file_type;
    a.href = uri;
    document.body.append(a);
    a.click();
    a.remove();
};

var fontTools = new FontTools();

$(function(){
    options();

    $("#uploadFont").on("change", function() {
        var font_file = $(this).prop('files')[0];
        $("#fontFile").text(font_file.name);
        openFont(font_file)
    });

    $("input[name=charset]").on("change", function() {
        chars = " ";
        $("input[name=charset]:checked").each(function() {
            chars += charsets[$(this).val()];
        });
        $("#chars").val(chars);
    });

    $("input[name=option]").on("change", options);

    $(".download").on("click", function() {
        chars = $("#chars").val();
        setFontSize();
        data = fontTools.getData(font, chars.split(""), font_size);
        var id = $(this).attr('id')
        if (id === "downloadZip") { downloadAsZip(data); } 
        else if (id === "downloadTxt") { downloadAsTxt(data); };
    });
});