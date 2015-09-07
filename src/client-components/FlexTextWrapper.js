/**
 * FlexTextWrapper.js
 *
 * Thin convenience wrapper around Phaser text methods
 */

module.exports = {
    makeFlexText: function (x, y, text, style) {
        if (style.bitmap) {
            var t = this.game.make.bitmapText(x, y, style.bitmap, style.size, style.align);
        } else {
            t = this.game.make.text(x, y, text, style);
        }
        return t;
    },

    addFlexText: function (x, y, text, style, group) {
        var t = this.makeFlexText(x, y, text, style);
        group = group || this.world;
        group.add(t);
        return t;
    }
};