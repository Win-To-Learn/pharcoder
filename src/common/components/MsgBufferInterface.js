/**
 * MsgBufferInterface.js
 * Server side
 */
'use strict';

var idToField = [];

var fieldToId = {};

var fieldToType = {};

var finalized = false;

module.exports = {
    finalize: function () {
        // Sort fields to ensure ids match on both sides
        idToField.sort();
        for (var i = 0; i < idToField.length; i++) {
            fieldToId[idToField[i]] = i;
        }
        finalized = true;
    },

    newMsgBuffer: function (size) {
        return new MsgBuffer(size);
    },

    registerField: function (name, type) {
        type = type || 'null';
        if (finalized) {
            console.log('WARNING: Attempt to register field ' + name + ' after finalization');
            return;
        }
        if (!fieldToType[name]) {
            idToField.push(name);
            fieldToType[name] = type;
        }
    }
};

var MsgBuffer = function (size) {
    this.buffer = new Buffer(size);
    this.len = 0;
    this.marks = {};
};

MsgBuffer.prototype.skip = function (n) {
    this.len += n;
};

MsgBuffer.prototype.reset = function () {
    this.len = 0;
    this.marks = {};
};

MsgBuffer.prototype.mark = function (name, skip) {
    this.marks[name] = this.len;
    if (skip) {
        this.len += skip;
    }
};

MsgBuffer.prototype.rewindToMark = function (mark) {
    this.len = this.marks[mark] || 0;
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

MsgBuffer.prototype.addUFixed16 = function (v) {
    this.buffer.writeUInt16BE(Math.floor(v * 1000), this.len, true);
    this.len += 2;
};

MsgBuffer.prototype.addUFixed32 = function (v) {
    this.buffer.writeUInt32BE(Math.floor(v * 1000), this.len, true);
    this.len += 4;
};

MsgBuffer.prototype.addFixed16 = function (v) {
    this.buffer.writeInt16BE(Math.floor(v * 1000), this.len, true);
    this.len += 2;
};

MsgBuffer.prototype.addFixed32 = function (v) {
    this.buffer.writeInt32BE(Math.floor(v * 1000), this.len, true);
    this.len += 4;
};

MsgBuffer.prototype.writeUInt8AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeUInt8(v, p, true);
};

MsgBuffer.prototype.writeUInt16AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeUInt16BE(v, p, true);
};

MsgBuffer.prototype.writeUInt32AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeUInt32BE(v, p, true);
};

MsgBuffer.prototype.writeInt8AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeInt8(v, p, true);
};

MsgBuffer.prototype.writeInt16AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeInt16BE(v, p, true);
};

MsgBuffer.prototype.writeInt32AtMark = function (v, mark) {
    var p = this.marks[mark] || 0;
    this.buffer.writeInt32BE(v, p, true);
};

MsgBuffer.prototype.addFieldValue = function (field, v) {
    var type = fieldToType[field];
    if (!type) {
        console.log('WARNING: Attempting to use unregistered field ' + field);
        return;
    }
    var fid = fieldToId[field];
    this.buffer.writeUInt16BE(fid, this.len, true);
    this.len += 2;
    var pos, n, i;
    switch (type) {
        case 'boolean':
        case 'uint8':
            this.buffer.writeUInt8(v, this.len, true);
            this.len += 1;
            break;
        case 'int8':
            this.buffer.writeInt8(v, this.len, true);
            this.len += 1;
            break;
        case 'uint16':
            this.buffer.writeUInt16BE(v, this.len, true);
            this.len += 2;
            break;
        case 'int16':
            this.buffer.writeInt16BE(v, this.len, true);
            this.len += 2;
            break;
        case 'uint32':
            this.buffer.writeUInt32BE(v, this.len, true);
            this.len += 4;
            break;
        case 'int32':
            this.buffer.writeInt32BE(v, this.len, true);
            this.len += 4;
            break;
        case 'ufixed16':
            this.buffer.writeUInt16BE(Math.floor(v * 1000), this.len, true);
            this.len += 2;
            break;
        case 'fixed16':
            this.buffer.writeInt16BE(Math.floor(v * 1000), this.len, true);
            this.len += 2;
            break;
        case 'ufixed32':
            this.buffer.writeUInt32BE(Math.floor(v * 1000), this.len, true);
            this.len += 4;
            break;
        case 'fixed32':
            this.buffer.writeInt32BE(Math.floor(v * 1000), this.len, true);
            this.len += 4;
            break;
        case 'arrayuint8':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeUInt8(v[i], this.len + i, true);
            }
            this.len += v.length;
            break;
        case 'arrayint8':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt8(v[i], this.len + i, true);
            }
            this.len += v.length;
            break;
        case 'arrayuint16':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeUInt16BE(v[i], this.len + i * 2, true);
            }
            this.len += v.length * 2;
            break;
        case 'arrayint16':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt16BE(v[i], this.len + i * 2, true);
            }
            this.len += v.length * 2;
            break;
        case 'arrayuint32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeUInt32BE(v[i], this.len + i * 4, true);
            }
            this.len += v.length * 4;
            break;
        case 'arrayint32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt32BE(v[i], this.len + i * 4, true);
            }
            this.len += v.length * 4;
            break;
        case 'arrayufixed16':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeUInt16BE(Math.floor(v[i] * 1000), this.len + i * 2, true);
            }
            this.len += v.length * 2;
            break;
        case 'arrayfixed16':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt16BE(Math.floor(v[i] * 1000), this.len + i * 2, true);
            }
            this.len += v.length * 2;
            break;
        case 'arrayufixed32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeUInt32BE(Math.floor(v[i] * 1000), this.len + i * 4, true);
            }
            this.len += v.length * 4;
            break;
        case 'arrayfixed32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt32BE(Math.floor(v[i] * 1000), this.len + i * 4, true);
            }
            this.len += v.length * 4;
            break;
        case 'pairarrayfixed16':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt16BE(Math.floor(v[i][0] * 1000), this.len + i * 2, true);
                this.buffer.writeInt16BE(Math.floor(v[i][1] * 1000), this.len + 2 + i * 2, true);
            }
            this.len += v.length * 4;
            break;
        case 'pairarrayfixed32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt16BE(Math.floor(v[i][0] * 1000), this.len + i * 2, true);
                this.buffer.writeInt16BE(Math.floor(v[i][1] * 1000), this.len + 4 + i * 2, true);
            }
            this.len += v.length * 8;
            break;
        case 'json':
            v = JSON.stringify(v);
            // Fall through intended here
        case 'string':
            v = v || '';        // Probably something better to do here
            pos = this.len;
            this.len += 2;                              // Leave space to record length
            n = this.buffer.write(v, this.len);         // UTF-8
            this.buffer.writeUInt16BE(n, pos, true);
            this.len += n;
            break;
        case 'null':
            break;
    }
};