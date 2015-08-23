/**
 * Marshal.js
 *
 * Marshal native JS into and out of JS-interp
 */
'use strict';

var Marshal = {};

//Marshal.wrap = function (interpreter, func, prepop) {
//    var argMarshalers = [];
//    var argPrepop = [];
//    for (var i = 0, l = func.meta.args.length; i < l; i++) {
//        var meta = func.meta.args[i];
//        if (prepop[meta.name]) {
//            argPrepop[i] = prepop[meta.name];
//        } else {
//            argMarshalers[i] = interpToNative[meta.type];
//        }
//    }
//    if (func.meta.returns) {
//        var returnMarshaler = nativeToInterp[func.meta.returns.type];
//    }
//    return function () {
//        var skipped = 0;
//        var args = [];
//        var l = Math.max(arguments.length, argMarshalers.length, argPrepop.length);
//        for (var i = 0; i < l; i++) {
//            var arg = arguments[i - skipped];
//            if (argPrepop[i]) {
//                args.push(argPrepop[i]);
//                skipped++;
//            } else if (arg && argMarshalers[i]) {
//                args.push(argMarshalers[i](arg));
//            } else {
//                args.push(undefined);
//            }
//        }
//        var r = func.apply(interpreter, args);      // Maybe need different/custom context
//        if (returnMarshaler) {
//            return returnMarshaler(r);
//        }
//    };
//};

Marshal.wrap = function (interpreter, func, prepop) {
    return function () {
        var aL = arguments.length;
        var pL = prepop.length;
        var skipped = 0;
        var args = [];
        for (var i = 0; i < pL || aL > 0; i++) {
            if (prepop[i]) {
                args.push(prepop[i]);
                skipped++;
            } else if (arguments[i-skipped]) {
                args.push(interpToNative[arguments[i-skipped].type](arguments[i-skipped]));
                aL--;
            } else {
                args.push(undefined);
            }
        }
        var r = func.apply(interpreter, args);
        if (r) {
            return nativeToInterp[typeof r](interpreter, r);
        }
    }
};

var interpToNative = {};

interpToNative.string = function (s) {
    return s.toString();
};

interpToNative.object = function (o) {
    if (typeof o.length !== 'undefined') {
        var native = [];
    } else {
        native = {};
    }
    o.__native = native;
    for (var k in o.properties) {
        var p = o.properties[k];
        if (p.isPrimitive) {
            native[k] = p.data;
        } else if (p.__native) {
            native[k] = p.__native;
        } else {
            native[k] = interpToNative.object(p);
        }
    }
    delete o.__native;
    return native;
};

var nativeToInterp = {};

nativeToInterp.string = function (interpreter, s) {
    console.log('primitive', s);
    return interpreter.createPrimitive(s);
};
nativeToInterp.number = nativeToInterp.string;
nativeToInterp.boolean = nativeToInterp.string;

nativeToInterp.object = function (interpreter, o) {
    if (o.getUpdatePacket) {
        o = o.getUpdatePacket(true);
    }
    if (o instanceof Array) {
        var pseudo = interpreter.createObject(interpreter.ARRAY);
        o.__pseudo = pseudo;
        for (var i = 0, l = o.length; i < l; i++) {
            if (o[i].__pseudo) {
                interpreter.setProperty(pseudo, i, o[i]);
            } else {
                interpreter.setProperty(pseudo, i, nativeToInterp[typeof o[i]](interpreter, o[i]));
            }
        }
    } else {
        pseudo = interpreter.createObject(interpreter.OBJECT);
        o.__pseudo = pseudo;
        for (i in o) {
            if (i === '__pseudo') {
                continue;
            }
            if (o[i].__pseudo) {
                interpreter.setProperty(pseudo, i, o[i]);
            } else {
                interpreter.setProperty(pseudo, i, nativeToInterp[typeof o[i]](interpreter, o[i]));
            }
        }
    }
};

module.exports = Marshal;