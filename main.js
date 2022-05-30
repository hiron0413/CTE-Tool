var chars = " ";
const charsets = {
    number: "0123456789", 
    u_alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    l_alphabet: "abcdefghijklmnopqrstuvwxyz",
    symbol1: ".,:;!?|#$%&-=^~+*@_<>{}[]()\"'\\/‘’“”",
    symbol2: "€¥£₽₹₩¢¤§±×÷¶⋅",
    u_greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
    l_greek: "αβγδεζηθικλμνξοπρστυφχψω",
    hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょー",
    katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッャュョヴ"
};
const replace = {".": "-dot", "/": "-slash", "\\": "-back_slash", ":": "-colon", " ": "-space"}
const type = { ".zip": "application/zip", ".txt": "text/plain", ".sprite3": "application/x.scratch.sprite3" }
var first_costume = "";
var options = { "rect": true, "replace": true, "uncompressed": false, "script": false, "reset": false, "deleteAllMonitors": false };
var checked = [];
var font = {};
var font_name = "";
const font_size = 100;
var cte_blocks = {};
var project_data = {};
var project_sb3 = {};
var sb3_file_name = "";
var svg_rect = { x: 0, y: 0, w: 480, h: 360 };

class FontTools {
    getBoundingBox(font, char, size) {
        return font.getPath(char, 0, 0, size).getBoundingBox();
    }
    getWidth(font, char, size) {
        return font.getAdvanceWidth(char, size);
    }
    getKerning(font, char1, char2, size) {
        return font.getKerningValue(font.charToGlyph(char1), font.charToGlyph(char2)) * size / font.unitsPerEm;
    }
    toPath(font, char, size) {
        return font.getPath(char, 240, 180, size).toPathData(3);
    }
    toSVG(font, char, size, color = "#F00", rect = true) {
        const path = this.toPath(font, char, size);
        if (rect) {
            return `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><rect x="${svg_rect.x}" y="${svg_rect.y}" width="${svg_rect.w}" height="${svg_rect.h}" fill-opacity="0"/><path fill="${color}" d="${path}"/></svg>`;
        } else {
            return `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="${path}"/></svg>`;
        }
    }
    getMaxMin(font, chars, size) {
        var yMaxList = [0];
        var yMinList = [0];
        var xMaxList = [0];
        var xMinList = [0];
        var box = {};
        chars.forEach(_char => {
            box = this.getBoundingBox(font, _char, size);
            yMaxList.push(box.y2);
            yMinList.push(box.y1);
            xMaxList.push(box.x2);
            xMinList.push(box.x1);
        });

        return {
            "xMax": Math.max.apply(null, xMaxList),
            "xMin": Math.min.apply(null, xMinList),
            "yMax": Math.max.apply(null, yMaxList),
            "yMin": Math.min.apply(null, yMinList)
        }
    }
    getData(font, chars, size, color = "#ff0000", opts) {
        var SVGText = [];
        var w = [];
        var kern = [];

        const ascender = font.ascender / font.unitsPerEm;
        const descender = font.descender / font.unitsPerEm;
        const line_gap = font.tables.hhea.lineGap / font.unitsPerEm;

        chars.forEach(_char => {
            SVGText.push(this.toSVG(font, _char, size, color, opts.rect));
            w.push(this.getWidth(font, _char, 1));
            chars.forEach(_char2 => {
                kern.push(this.getKerning(font, _char, _char2, 1));
            });
        });

        return { chars: chars, SVGText: SVGText, width: w, kerning: kern, ascender: ascender, descender: descender, lineGap: line_gap };
    }
}

class Sprite {
    constructor(data) {
        this.data = data;
    }

    setVariable(name, data) {
        const ids = Object.keys(this.data.variables);
        const values = Object.values(this.data.variables);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                this.data.variables[ids[i]][1] = data;
                return;
            }
        }
        const id = uid();
        this.data.variables[id] = [name, data];
    }

    setList(name, data) {
        const ids = Object.keys(this.data.lists);
        const values = Object.values(this.data.lists);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                this.data.lists[ids[i]][1] = data;
                return;
            }
        }
        const id = uid();
        this.data.lists[id] = [name, data];
    }

    addCostume(name, svg) {
        const data = this.generateCostumeData(name, svg);
        this.data.costumes.push(data);
    }

    generateCostumeData(name, svg) {
        const md5_text = md5(svg);
        return {
            assetId: md5_text,
            name: name,
            bitmapResolution: 1,
            md5ext: md5_text + ".svg",
            dataFormat: "svg",
            rotationCenterX: 240,
            rotationCenterY: 180
        }
    }

    get object() {
        return this.data;
    }

    get json() {
        return JSON.stringify(this.data);
    }
}

class Project {
    constructor(data) {
        this.data = data;
    }

    getSpriteIndex(name) {
        const targets = this.data.targets;
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].name === name) {
                return i;
            }
        }
        return "Not found";
    }

    setProperty(spriteIndex, property, data) {
        if (this.data.targets[spriteIndex].hasOwnProperty(property)) {
            this.data.targets[spriteIndex][property] = data;
        } else {
            return "Not found";
        }
    }

    getProperty(spriteIndex, property) {
        if (this.data.targets[spriteIndex].hasOwnProperty(property)) {
            return this.data.targets[spriteIndex][property];
        } else {
            return "Not found";
        }
    }
  
    setVariable(spriteIndex, name, data) {
        const ids = Object.keys(this.data.targets[spriteIndex].variables);
        const values = Object.values(this.data.targets[spriteIndex].variables);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                this.data.targets[spriteIndex].variables[ids[i]][1] = data;
                return;
            }
        }
        const id = uid();
        this.data.targets[spriteIndex].variables[id] = [name, data];
    }

    getList(spriteIndex, name) {
        const ids = Object.keys(this.data.targets[spriteIndex].lists);
        const values = Object.values(this.data.targets[spriteIndex].lists);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                return this.data.targets[spriteIndex].lists[ids[i]][1];
            }
        }
        return "Not found"
    }

    setList(spriteIndex, name, data) {
        const ids = Object.keys(this.data.targets[spriteIndex].lists);
        const values = Object.values(this.data.targets[spriteIndex].lists);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                this.data.targets[spriteIndex].lists[ids[i]][1] = data;
                return;
            }
        }
        const id = uid();
        this.data.targets[spriteIndex].lists[id] = [name, data];
    }

    appendList(spriteIndex, name, data) {
        const ids = Object.keys(this.data.targets[spriteIndex].lists);
        const values = Object.values(this.data.targets[spriteIndex].lists);
        for (let i = 0; i < ids.length; i++) {
            if (values[i][0] === name) {
                this.data.targets[spriteIndex].lists[ids[i]][1] = this.data.targets[spriteIndex].lists[ids[i]][1].concat(data);
                return;
            }
        }
        const id = uid();
        this.data.targets[spriteIndex].lists[id] = [name, data];
    }

    setBlocks(spriteIndex, data) {
        this.data.targets[spriteIndex].blocks = data;
    }

    addCostume(spriteIndex, name, svg, zip) {
        const data = this.generateCostumeData(name, svg);
        this.data.targets[spriteIndex].costumes.push(data);
        zip.file(data.md5ext, svg);
    }

    generateCostumeData(name, svg) {
        const md5_text = md5(svg);
        return {
            assetId: md5_text,
            name: name,
            bitmapResolution: 1,
            md5ext: md5_text + ".svg",
            dataFormat: "svg",
            rotationCenterX: 240,
            rotationCenterY: 180
        }
    }

    deleteAllCostumes(spriteIndex) {
        this.data.targets[spriteIndex].costumes = [];
    }

    changeSpriteName(spriteIndex, name) {
        this.data.targets[spriteIndex].name = name;
    }

    deleteAllMonitors() {
        this.data.monitors = [];
    }

    get object() {
        return this.data;
    }

    get json() {
        return JSON.stringify(this.data);
    }
}

function changeOptions(){
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
}

function openFont(file) {
    var reader = new FileReader();
    reader.onload = function() {
        font = opentype.parse(reader.result);
        font_name = font.names.fullName.en;
        setRectSize();
    }

    reader.readAsArrayBuffer(file);
}

function openSb3(file) {
    var reader = new FileReader();
    reader.onload = function() {
        JSZip.loadAsync(reader.result)
            .then(zip => {
                project_sb3 = zip
                zip.file("project.json").async("string")
                    .then(data => { 
                        project_data = JSON.parse(data);
                    })
            });
    }

    reader.readAsArrayBuffer(file);
}

function setRectSize() {
    const maxMin = fontTools.getMaxMin(font, chars.split(""), font_size);
    svg_rect.x = maxMin.xMin + 240 - 10;
    svg_rect.y = maxMin.yMin + 180 - 10;
    svg_rect.w = maxMin.xMax - maxMin.xMin + 20;
    svg_rect.h = maxMin.yMax - maxMin.yMin + 20;
}

function splitExt(file) {
    const re = /(.*)\.(.+?$)/
    var result = re.exec(file)
    return { basename: result[1], ext: result[2] }
}

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function downloadAsZip(data) {
    var zip = new JSZip();
    zip.file("chars.txt", data.chars.join("\n"));
    zip.file("width.txt", data.width.join("\n"));
    zip.file("kerning.txt", data.kerning.join("\n"));
    var svg = zip.folder("svg");
    if (options["replace"]) {
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] in replace) {
                svg.file(replace[chars[i]] + ".svg", data.SVGText[i], {binary: false});
            } else {
                svg.file(chars[i] + ".svg", data.SVGText[i], {binary: false});
            }
        }
    } else {
        for (let i = 0; i < chars.length; i++) {
            svg.file(chars[i] + ".svg", data.SVGText[i], {binary: false});
        }
    }

    var _option = {
        type: "blob",
    }

    if (!options["uncompressed"]) {
        _option.compression = "DEFLATE",
        _option.compressionOptions = {
            level: 6
        }
    }
        
    zip.generateAsync(_option)
    .then(function(blob) {
        download(blob, font_name, ".zip");
    });
}

function downloadAsTxt(data) {
    var txt = [];
    txt.push(data.chars.join("\n"));
    txt.push(data.SVGText.join("\n"));
    txt.push(data.width.join("\n"));
    txt.push(data.kerning.join("\n"));
    txt = txt.join("\n-----\n");
    download(txt, font_name, ".txt");
}

function downloadAsProject(sb3, data, file_name) {
    var project = new Project(deepcopy(project_data));
    const _cte = first_costume ? first_costume : _svg(0, 0);
    const _big = _svg(480, 360, '<rect x="0" y="0" width="480" height="360" fill="#fff"/>');
    const _medium = _svg(480, 360, '<rect x="190" y="130" width="100" height="100" fill="#fff"/>');
    const _small = _svg(0,0);
    const fontID = "$" + fid(10);

    var sprite_index = project.getSpriteIndex("*CTE*");
    if (sprite_index === "Not found") { alert("スプライト「*CTE*」が見つかりませんでした"); return; }
  
    var fonts = Math.round(project.getList(sprite_index, "CTE | @fonts").length / 7);
    var costumes = project.getProperty(sprite_index, "costumes");
    
    if (options["reset"]) {
        // delete all fonts
        costumes.forEach(costume => { sb3.remove(costume.md5ext) });
        project.deleteAllCostumes(sprite_index);
        project.setList(0, "CTE | フォント一覧")
        project.setList(sprite_index, "CTE | @fonts", []);
        project.setList(sprite_index, "CTE | @width", []);
        project.setList(sprite_index, "CTE | @kerning", []);
        fonts = 0;
        project.addCostume(sprite_index, "CTE", _cte, sb3);
        project.addCostume(sprite_index, "big", _big, sb3);
        project.addCostume(sprite_index, "medium", _medium, sb3);
        project.addCostume(sprite_index, "small", _small, sb3);
        costumes = project.getProperty(sprite_index, "costumes");
    }
  
    if (options["script"]) { 
        // reset blocks
        project.setProperty(sprite_index, "blocks", cte_blocks);
    }

    project.setProperty(sprite_index, "name", "CTE");
    if (options["deleteMonitors"]) {
        project.deleteAllMonitors();
    }

    // add data
    project.appendList(sprite_index, "CTE | @fonts", [fontID, font_name, data.chars.length, costumes.length + 1, data.ascender, data.descender, data.lineGap]);
    project.appendList(0, "CTE | フォント一覧", [font_name])
    project.appendList(sprite_index, "CTE | @width", [fontID].concat(data.width));
    project.appendList(sprite_index, "CTE | @kerning", [fontID].concat(data.kerning));

    // add chars
    for (let i = 0; i < data.chars.length; i++) {
        const char = data.chars[i];
        const SVG = data.SVGText[i];
        const name = "=" + char + "/" + String(fonts + 1);
        project.addCostume(sprite_index, name, SVG, sb3);
    }

    sb3.file("project.json", project.json);

    var _option = {
        type: "blob",
        mimeType: "application/x.scratch.sb3",
    }

    if (!options["uncompressed"]) {
        _option.compression = "DEFLATE",
        _option.compressionOptions = {
            level: 6
        }
    }
  
    sb3.generateAsync(_option)
    .then(function(blob) {
        download(blob, file_name, ".sb3");
        //saveAs(content, font_name + ".sb3");
    });

    function _svg(w = 480, h = 360, text) {
        return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">` + text + "</svg>"
    }
}

function md5(text) {
    return CryptoJS.MD5(text).toString();
}

function uid() {
    var id = "";
    const _chars = "!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const _len = _chars.length;
    for (let i = 0; i < 20; i++) {
        id += _chars.charAt(Math.floor(Math.random() * _len));
    }
    return id;
}

function fid(len) {
    // fontID generator
    var id = "";
    const _chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const _len = _chars.length;
    for (let i = 0; i < len; i++) {
        id += _chars.charAt(Math.floor(Math.random() * _len));
    }
    return id;
}

function download(data, file_name, file_type) {
    var blob;
    switch(file_type) {
        case ".zip": blob = data; break;
        case ".sprite3": blob = data; break;
        case ".sb3": blob = data; break;
        default: blob = new Blob([data],{ type: type[file_type] });
    }
    if (navigator.msSaveOrOpenBlob) {
        // for IE
        navigator.msSaveOrOpenBlob(blob, filename);
    } else if ("download" in HTMLAnchorElement.prototype) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a")
        document.body.appendChild(a);
        a.download = file_name + file_type;
        a.href = url;
        a.click();
        window.setTimeout(() => {
            a.remove();
            window.URL.revokeObjectURL(url);
        }, 1E4);
    } else {
        // for iOS 12
        var popup = window.open("", "_blank");
        const reader = new FileReader();
        reader.onloadend = function() {
            popup.location.href = reader.result;
            popup = null;
        };
        reader.readAsDataURL(blob);
    }
}

function isEmpty(obj) {
    return !Object.keys(obj).length;
}

var fontTools = new FontTools();

$(function(){
    changeOptions();

    $.ajax({ url: "first_costume.txt" }).done(svg => { first_costume = svg; });
    $.getJSON("blocks.json").done(json => { cte_blocks = json });

    $("#uploadFont").on("change", function() {
        var font_file = $(this).prop('files')[0];
        $("#fontFile").text(font_file.name);
        openFont(font_file);
    });

    $("#uploadSb3").on("change", function() {
        var sb3_file = $(this).prop('files')[0];
        $("#sb3File").text(sb3_file.name);
        openSb3(sb3_file);
        sb3_file_name = splitExt(sb3_file.name).basename;
    });

    $("input[name=charset]").on("change", function() {
        chars = " ";
        $("input[name=charset]:checked").each(function() {
            chars += charsets[$(this).val()];
        });
        $("#chars").val(chars);
    });

    $("input[name=option]").on("change", changeOptions);

    $(".download").on("click", function() {
        chars = $("#chars").val();

        if (isEmpty(font)) { alert("使うフォントをアップロードしてください"); return; }
        if (!chars) { alert("使う文字が入力されていません"); return; }
        setRectSize();
        const font_data = fontTools.getData(font, chars.split(""), font_size, "#ff0000", { rect: options.rect });
        
        var id = $(this).attr('id');
        switch (id) {
            case "downloadZip": downloadAsZip(font_data); break;

            case "downloadTxt": downloadAsTxt(font_data); break;

            case "downloadSb3":
                if (isEmpty(project_data)) {
                    alert("sb3ファイルがアップロードされていません")
                } else {
                    downloadAsProject(project_sb3, font_data, sb3_file_name);
                }
                break;
        }
    });
});