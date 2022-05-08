class FontTools {
    getBoundingBox(font, char, size) {
        return font.getPath(char, 0, 0, size).getBoundingBox();
    }

    getWidth(font, char, size) {
        return font.getAdvanceWidth(char, size);
    }

    getKerning(font, char1, char2) {
        return font.getKerningValue(charToGlyph(char1), charToGlyph(char2));
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
            box = this.getBoundingBox(font, char, size)
            yMaxList.push(box.y2);
            yMinList.push(box.y1);
            xMaxList.push(box.x2);
            xMinList.push(box.x1);
        });

        return {
            "xMax": Math.max.apply(null,xMaxList),
            "xMin": Math.max.apply(null,xMinList),
            "yMax": Math.max.apply(null,yMaxList),
            "yMin": Math.max.apply(null,yMinList)
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
                kerning.push(this.getKerning(font, char, char2))
            });
        });

        return { "SVGText":SVGText, "width":width, "kerning":kerning };
    };
};