/**
 * MsgBuffer.js
 *
 * Thin wrapper around Buffer with helper methods to track state
 */
'use strict';

var MsgBuffer = function (size) {
    this.buffer = new Buffer(size);
    this.len = 0;
};

MsgBuffer.prototype.skip = function (n) {
    this.len += n;
};

MsgBuffer.prototype.addUInt8 = function (v) {
    this.buffer.writeUInt8(v, this.len, true);
    this.len += 1;
};

MsgBuffer.prototype.addUInt16 = function (v) {
    this.buffer.writeUInt16BE(v, this.len, true);
    this.len += 2;
};

MsgBuffer.prototype.addUInt32 = function (v) {
    this.buffer.writeUInt32BE(v, this.len, true);
    this.len += 4;
};

MsgBuffer.prototype.addInt8 = function (v) {
    this.buffer.writeInt8(v, this.len, true);
    this.len += 1;
};

MsgBuffer.prototype.addInt16 = function (v) {
    this.buffer.writeInt16BE(v, this.len, true);
    this.len += 2;
};

MsgBuffer.prototype.addInt32 = function (v) {
    this.buffer.writeInt32BE(v, this.len, true);
    this.len += 4;
};

module.exports = MsgBuffer;
