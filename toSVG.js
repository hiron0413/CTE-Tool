class toSVG {
    constructor(font) {
        this.font = font
    };

    getWidth(char) {
        this.font.getAdvanceWidth(char, 100)
    }

    getKerning(char1, char2) {
        return this.font.getKerningValue(char1, char2) / 10;
    };

    toPath(char) {
        return this.font.getPath(char, 240, 180, 100);
    };

    toSVG(char, color="#ff0000") {
        const path = this.toPath(char);
        return '<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="480" height="360" fill-opacity="0"/><path fill="${color}" d="${path}"/></svg>'
    };

    getData(chars, color="#ff0000") {
        var SVGText = [];
        var width = [];
        var kerning = [];

        chars.forEach(char => {
            SVGText.push(this.toSVG(char, color));
            width.push(this.getWidth(char));
            chars.forEach(char2 => {
                kerning.push(this.getKerning(char, char2))
            });
        });

        return { "SVGText":SVGText, "width":width, "kerning":kerning };
    };
};