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
            //console.log(idToField[i], '-', i);
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
    if (size) {
        this.buffer = new Buffer(size);
    } else {
        this.buffer = null;
    }
    this.len = 0;
    this.marks = {};
};

// State management methods

MsgBuffer.prototype.skip = function (n) {
    this.len += n;
};

MsgBuffer.prototype.reset = function (buffer) {
    if (buffer) {
        this.buffer = buffer;
    }
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

// Trim for sending

MsgBuffer.prototype.export = function () {
    // Not sure why this is necessary
    return (new Uint8Array(this.buffer.slice(0, this.len))).buffer;

};

// Write methods

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
        console.log('WARNING: Attempting to write unregistered field ' + field);
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
                this.buffer.writeInt16BE(Math.floor(v[i][0] * 1000), this.len + i * 4, true);
                this.buffer.writeInt16BE(Math.floor(v[i][1] * 1000), this.len + i * 4 + 2, true);
            }
            this.len += v.length * 4;
            break;
        case 'pairarrayfixed32':
            this.buffer.writeUInt16BE(v.length, this.len, true);
            this.len += 2;
            for (i = 0; i < v.length; i++) {
                this.buffer.writeInt32BE(Math.floor(v[i][0] * 1000), this.len + i * 8, true);
                this.buffer.writeInt32BE(Math.floor(v[i][1] * 1000), this.len + i * 8 + 4, true);
            }
            this.len += v.length * 8;
            break;
        case 'tree':
            writeTree(this, v);
            break;
        case 'json':
            v = JSON.stringify(v);
            // Fall through intended here
        case 'string':
            if (typeof v !== 'string') {
                v = String(v);
            }
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

var writeTree = function (buf, tree) {
    buf.buffer.writeInt16BE(Math.floor(tree.x * 1000), buf.len, true);
    buf.len += 2;
    buf.buffer.writeInt16BE(Math.floor(tree.y * 1000), buf.len, true);
    buf.len += 2;
    if (tree.c) {
        var n = tree.c.length;
        buf.buffer.writeInt16BE(n, buf.len, true);
        buf.len += 2;
        for (var i = 0; i < n; i++) {
            writeTree(buf, tree.c[i]);
        }
    } else {
        buf.buffer.writeInt16BE(0, buf.len, true);
        buf.len += 2;
    }
};

// Read methods

MsgBuffer.prototype.readUInt8 = function () {
    var v = this.buffer.readUInt8(this.len, true);
    this.len += 1;
    return v;
};

MsgBuffer.prototype.readUInt16 = function () {
    var v = this.buffer.readUInt16BE(this.len, true);
    this.len += 2;
    return v;
};

MsgBuffer.prototype.readUInt32 = function () {
    var v = this.buffer.readUInt32BE(this.len, true);
    this.len += 4;
    return v;
};

MsgBuffer.prototype.readInt8 = function () {
    var v = this.buffer.readInt8(this.len, true);
    this.len += 1;
    return v;
};

MsgBuffer.prototype.readInt16 = function () {
    var v = this.buffer.readInt16BE(this.len, true);
    this.len += 2;
    return v
};

MsgBuffer.prototype.readInt32 = function () {
    var v = this.buffer.readInt32BE(this.len, true);
    this.len += 4;
    return v;
};

MsgBuffer.prototype.readUFixed16 = function () {
    var v = this.buffer.readUInt16BE(this.len, true) / 1000;
    this.len += 2;
    return v;
};

MsgBuffer.prototype.readUFixed32 = function () {
    var v = this.buffer.readUInt32BE(this.len, true) / 1000;
    this.len += 4;
    return v;
};

MsgBuffer.prototype.readFixed16 = function () {
    var v = this.buffer.readInt16BE(this.len, true) / 1000;
    this.len += 2;
    return v
};

MsgBuffer.prototype.readFixed32 = function () {
    var v = this.buffer.readInt32BE(this.len, true) / 1000;
    this.len += 4;
    return v;
};

MsgBuffer.prototype.readUInt8AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readUInt8(p, true);
};

MsgBuffer.prototype.readUInt16AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readUInt16BE(v, p, true);
};

MsgBuffer.prototype.readUInt32AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readUInt32BE(p, true);
};

MsgBuffer.prototype.readInt8AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readInt8(p, true);
};

MsgBuffer.prototype.readInt16AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readInt16BE(p, true);
};

MsgBuffer.prototype.readInt32AtMark = function (mark) {
    var p = this.marks[mark] || 0;
    return this.buffer.readInt32BE(p, true);
};

MsgBuffer.prototype.readFieldValue = function (r) {
    var fid = this.buffer.readUInt16BE(this.len, true);
    var field = idToField[fid];
    if (!field) {
        console.log('WARNING: Attempting to read unregistered field with id ' + fid);
        return;
    }
    var type = fieldToType[field];
    this.len += 2;
    var n, i, a;
    switch (type) {
        case 'boolean':
            r[field] = !!this.buffer.readUInt8(this.len, true);
            this.len += 1;
            break;
        case 'uint8':
            r[field] = this.buffer.readUInt8(this.len, true);
            this.len += 1;
            break;
        case 'int8':
            r[field] = this.buffer.readInt8(this.len, true);
            this.len += 1;
            break;
        case 'uint16':
            r[field] = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            break;
        case 'int16':
            r[field] = this.buffer.readInt16BE(this.len, true);
            this.len += 2;
            break;
        case 'uint32':
            r[field] = this.buffer.readUInt32BE(this.len, true);
            this.len += 4;
            break;
        case 'int32':
            r[field] = this.buffer.readInt32BE(this.len, true);
            this.len += 4;
            break;
        case 'ufixed16':
            r[field] = this.buffer.readUInt16BE(this.len, true) / 1000;
            this.len += 2;
            break;
        case 'fixed16':
            r[field] = this.buffer.readInt16BE(this.len, true) / 1000;
            this.len += 2;
            break;
        case 'ufixed32':
            r[field] = this.buffer.readUInt32BE(this.len, true) / 1000;
            this.len += 4;
            break;
        case 'fixed32':
            r[field] = this.buffer.readInt32BE(this.len, true) / 1000;
            this.len += 4;
            break;
        case 'arrayuint8':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readUInt8(this.len + i, true));
            }
            r[field] = a;
            this.len += n;
            break;
        case 'arrayint8':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readInt8(this.len + i, true));
            }
            r[field] = a;
            this.len += n;
            break;
        case 'arrayuint16':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readUInt16BE(this.len + i * 2, true));
            }
            a[field] = a;
            this.len += n * 2;
            break;
        case 'arrayint16':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readInt16BE(v[i], this.len + i * 2, true));
            }
            r[field] = a;
            this.len += n * 2;
            break;
        case 'arrayuint32':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readUInt32BE(this.len + i * 4, true));
            }
            r[field] = a;
            this.len += n * 4;
            break;
        case 'arrayint32':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readInt32BE(this.len + i * 4, true));
            }
            r[field] = a;
            this.len += n * 4;
            break;
        case 'arrayufixed16':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readUInt16BE(this.len + i * 2, true) / 1000);
            }
            r[field] = a;
            this.len += n * 2;
            break;
        case 'arrayfixed16':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readInt16BE(this.len + i * 2, true) / 1000);
            }
            r[field] = a;
            this.len += n * 2;
            break;
        case 'arrayufixed32':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readUInt32BE(this.len + i * 4, true) / 1000);
            }
            r[field] = a;
            this.len += n * 4;
            break;
        case 'arrayfixed32':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push(this.buffer.readInt32BE(this.len + i * 4, true) / 1000);
            }
            r[field] = a;
            this.len += n * 4;
            break;
        case 'pairarrayfixed16':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < n; i++) {
                a.push([this.buffer.readInt16BE(this.len + i * 4, true) / 1000,
                    this.buffer.readInt16BE(this.len + i * 4 + 2, true) / 1000]);
            }
            r[field] = a;
            this.len += n * 4;
            break;
        case 'pairarrayfixed32':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = [];
            for (i = 0; i < v.length; i++) {
                a.push([this.buffer.readInt32BE(this.len + i * 8, true) / 1000,
                    this.buffer.readInt32BE(this.len + i * 8 + 4, true) / 1000]);
            }
            r[field] = a;
            this.len += n * 8;
            break;
        case 'tree':
            r[field] = readTree(this);
            break;
        case 'json':
        case 'string':
            n = this.buffer.readUInt16BE(this.len, true);
            this.len += 2;
            a = this.buffer.toString('utf8', this.len, this.len + n);
            if (type === 'json') {
                console.log('json', a);
                a = JSON.parse(a);
            }
            r[field] = a;
            this.len += n;
            break;
        case 'null':
            r[field] = null;
            break;
    }
};

var readTree = function (buf) {
    var tree = {};
    tree.x = buf.buffer.readInt16BE(buf.len, true) / 1000;
    buf.len += 2;
    tree.y = buf.buffer.readInt16BE(buf.len, true) / 1000;
    buf.len += 2;
    var n = buf.buffer.readInt16BE(buf.len, true);
    buf.len += 2;
    if (n) {
        tree.c = [];
        for (var i = 0; i < n; i++) {
            tree.c.push(readTree(buf));
        }
    }
    return tree;
};