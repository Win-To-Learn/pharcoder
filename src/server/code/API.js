/**
 * API.js
 *
 * Public API for interacting with Starcoder world
 */
'use strict';

var decomp = require('poly-decomp');
var SCError = require('./SCError.js');

var StationBlock = require('../bodies/StationBlock.js');
var Turret = require('../bodies/Turret.js');

var api_key = 'key-426b722a669becf8c90a677a8409f907';
var domain = 'sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var API = {};

var max = Math.max;
var min = Math.min;
var sqrt = Math.sqrt;
var atan2 = Math.atan2;
var cos = Math.cos;
var sin = Math.sin;
var clamp = function (a, x, b) {
    return  x < a ? a : (x > b ? b : x);
};
var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
var D2R = Math.PI / 180;

var starcoder = null;

const sbLimit = 100;                     // Max number of station blocks in world
const sbDiameter = 20;                  // Max extent of station block
const sbPoints = 40;                    // Max number of points making station block
var sbCount = 0;                        // Number of existing station blocks

/**
 * init
 *
 * Init api and import references
 *
 * @param sc {Starcoder}
 */
Object.defineProperty(API, 'init', {
    value: function (sc) {
        starcoder = sc;
    },
    enumerable: false
});

/**
 * Set line color for ship
 *
 * @param player {Player}
 * @param color {string}
 */
API.changeShipColor = function (player, color) {
    var d = new Date();
    player.timestamp_new = d.getTime();

    var data = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'jonathanmartinnyc@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just altered the color of their ship!'
    };
    var data2 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'johndh88@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just altered the color of their ship!'
    };

    var oldColor = player.getShip().lineColor;
    if (color !== oldColor || color == '#ff0000') {
        player.getShip().lineColor = color;
        player.achieve('changecolor');
    }

    if (color == '#ffa500') {
        data = {
            from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
            to: 'jonathanmartinnyc@gmail.com',
            subject: 'Student Progress',
            text: 'Your child or student - ' + player.gamertag + ' - has just camouflaged themselves from the Gwexi using a specific hexadecimal code for ship color. Very clever!'
        };
        data2 = {
            from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
            to: 'johndh88@gmail.com',
            subject: 'Student Progress',
            text: 'Your child or student - ' + player.gamertag + ' - has just camouflaged themselves from the Gwexi using a specific hexadecimal code for ship color. Very clever!'
        };


    }
    if (player.role === 'player') {
            if(player.timestamp_old) {
                if (player.timestamp_old + 5000 < player.timestamp_new) {
                    mailgun.messages().send(data, function (error, body) {
                    });
                    mailgun.messages().send(data2, function (error, body) {
                    });
                }
            }
            else{
                mailgun.messages().send(data, function (error, body) {
                });
                mailgun.messages().send(data2, function (error, body) {
                });
            }
            player.timestamp_old = player.timestamp_new;
    }
};


/**
 * Set outline / physics shape for body
 *
 * @param player {Player}
 * @param shape {Array<Array>}
 */
API.changeShipShape = function (player, shape) {
    //if (shape.length < 3) {
    //    throw new SCError('Path must contain at least three points');
    //}
    //// Reversing x's due to coordinate system weirdness. Should probably be fixed elsewhere but this'll do for now

    for (var i = 0, l = shape.length; i < l; i++) {
        shape[i][0] = -shape[i][0];
        shape[i][1] = -shape[i][1];
    }
    //// Check to make sure poly isn't self intersecting
    //var p = new decomp.Polygon();
    //p.vertices = shape;
    //if (!p.isSimple()) {
    //    throw new SCError('Path cannot cross itself');
    //}
    _normalizeShape(shape);
    player.getShip().shape = shape;

    function parseToM(coordPair){
        var retString = 'M ' + coordPair[0] + ' ' + coordPair[1] + ',';
        return retString;
    }

    function parseToL(coordPair){
        var retString = 'L ' + coordPair[0] + ' ' + coordPair[1] + ' ';
        return retString;
    }


    var mainStr = parseToM(shape[0]);

    for(i=1;i<shape.length;i++){
        mainStr = mainStr + parseToL(shape[i]);
    }

    mainStr = mainStr + parseToL(shape[0]) + 'z';

    var d = new Date();
    player.timestamp_new = d.getTime();
    var data = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'jonathanmartinnyc@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just changed the shape of their ship using points on the x-y coordinate plane!' + '\r' + '\r' + mainStr

    };
    var data2 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'johndh88@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just changed the shape of their ship using points on the x-y coordinate plane!' + '\r' + '\r' + mainStr

    };



    if (player.role === 'player') {
        if(player.timestamp_old) {
            if (player.timestamp_old + 5000 < player.timestamp_new) {
                mailgun.messages().send(data, function (error, body) {

                });
                mailgun.messages().send(data2, function (error, body) {

                });


            }
        }
        else{
            mailgun.messages().send(data, function (error, body) {

            });

            mailgun.messages().send(data2, function (error, body) {

            });
        }
        player.timestamp_old = player.timestamp_new;

    }
};

API.directionsToPoints = function (player, directions) {
    var x = 0, y = 0;
    var heading = Math.PI / 2;
    var shape = [[0, 0]];
    for (var i = 0, l = directions.length; i < l; i++) {
        var step = directions[i].split(/\s+/);
        var command = step[0].toLowerCase();
        var param = Number(step[1]);
        switch (command) {
            case 'fd':
            case 'forward':
                x += cos(heading) * param;
                y += sin(heading) * param;
                shape.push([x, y]);
                break;
            case 'bk':
            case 'back':
                x -= cos(heading) * param;
                y -= sin(heading) * param;
                shape.push([x, y]);
                break;
            case 'rt':
            case 'right':
                heading -= param * D2R;
                break;
            case 'lt':
            case 'left':
                heading += param * D2R;
                break;
            default:
                throw new SCError('Unrecognized direction');
        }
    }
    return shape;
};

/**
 * Returns an array of all bodies within range units of body, optionally filtered by bodytype
 *
 * @param player {Player}
 * @param body {p2.Body}
 * @param range {number}
 * @param bodytype {string}
 * @returns {Array}
 */
API.distanceScan = function (player, bodytype) {
    var ship = player.getShip();
    var x = ship.position[0];
    var y = ship.position[1];
    var prev_distance = 99999;
    var distance;
    var result = [];
    for (var i = 0, l = ship.world.bodies.length; i < l; i++) {
        var target = ship.world.bodies[i];
        if (target.serverType && (bodytype === target.serverType)) {
            distance = Math.sqrt((x - target.position[0]) * (x - target.position[0]) + (y - target.position[1]) * (y - target.position[1]));
            if (distance < prev_distance) {
                prev_distance = distance;
            }
        }
    }
    return prev_distance;
};

/**
 * Returns an array of all bodies within range units of body, optionally filtered by bodytype
 *
 * @param player {Player}
 * @param body {p2.Body}
 * @param range {number}
 * @param bodytype {string}
 * @returns {Array}
 */
API.closestBody = function (player, bodytype) {
    var ship = player.getShip();
    var x = ship.position[0];
    var y = ship.position[1];
    var prev_distance = 99999;
    var distance;
    var result = [];
    var closeBody;
    for (var i = 0, l = ship.world.bodies.length; i < l; i++) {
        var target = ship.world.bodies[i];
        if (target.serverType && (bodytype === target.serverType)) {
            distance = Math.sqrt((x - target.position[0]) * (x - target.position[0]) + (y - target.position[1]) * (y - target.position[1]));
            if (distance < prev_distance) {
                prev_distance = distance;
                closeBody =target;
            }
        }
    }
    return closeBody;
};

/**
 * Returns an array of all bodies within range units of body, optionally filtered by bodytype
 *
 * @param player {Player}
 * @param body {p2.Body}
 * @param range {number}
 * @param bodytype {string}
 * @returns {Array}
 */
API.scan = function (player, body, range, bodytype) {
    var r2 = range * range;
    var x = body.position[0];
    var y = body.position[1];
    var result = [];
    for (var i = 0, l = body.world.bodies.length; i < l; i++) {
        var target = body.world.bodies[i];
        if (target === body) {
            continue;
        }
        if (target.serverType && (!bodytype || bodytype === target.serverType)) {
            if ((x-target.position[0])*(x-target.position[0]) + (y-target.position[1])*(y-target.position[1]) <= r2) {
                result.push(target);
            }
        }
    }
    return result;
};

/**
 * Scan centered around player ship
 *
 * @param player
 * @param bodytype
 * @returns {Array}
 */
API.localScan = function (player, bodytype) {
    var ship = player.getShip();
    return API.scan(player, ship, ship.scanRange || 25, bodytype);
};

/**
 * Fire one shot
 *
 * @param player {Player}
 */
API.shoot = function (player) {
    var ship = player.getShip();
    ship.state.firing = true;
    ship.state.oneshot = true;
};

/**
 * Fire thruster in one pulse
 *
 * @param player {Player}
 */
API.thrust = function (player, force) {
    var ship = player.getShip();
    ship.state.thrust = force;
    setTimeout(function(){ship.state.thrust = 0;}, 500)
    //ship.state.thrust = false;
};


/**
 * Turn in one pulse
 *
 * @param player {Player}
 */
API.turn = function (player, force) {
    var ship = player.getShip();
    ship.state.turn = force;
    setTimeout(function(){ship.state.turn = 0;}, 500)
    //ship.state.thrust = false;
};

/**
 * Set scale factor for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setShipScale = function (player, scale) {

    var d = new Date();
    player.timestamp_new = d.getTime();

    var data = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'jonathanmartinnyc@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just altered the scale of their ship!'
    };
    var data2 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'johndh88@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just altered the scale of their ship!'
    };

    if (player.role === 'player') {
        if(player.timestamp_old) {
            if (player.timestamp_old + 5000 < player.timestamp_new) {
                mailgun.messages().send(data, function (error, body) {

                });
                mailgun.messages().send(data2, function (error, body) {

                });


            }
        }
        else{
            mailgun.messages().send(data, function (error, body) {

            });

            mailgun.messages().send(data2, function (error, body) {

            });
        }
        player.timestamp_old = player.timestamp_new;

    }

    player.getShip().vectorScale = clamp(0.2, scale, 3);

};

/**
 * Set thrust force for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setThrustForce = function (player, force) {
    var oldForce = player.getShip().thrustForce;
    if(force !== oldForce){
        player.getShip().thrustForce = clamp(100, force, 1500);
        player.achieve('changethrust');
    }
};


/**
 * Set turn force for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setTurningForce = function (player, force) {
    var oldForce = player.getShip().thrustForce;
    if (force !== oldForce) {
        player.getShip().turningForce = clamp(10, force, 150);
        player.achieve('changethrust');
    }
};

/**
 * Move ship to new position
 *
 * @param player {Player}
 * @param x {number}
 * @param y {number}
 */
function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

API.translate = function (player, x, y) {

    var data = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'jonathanmartinnyc@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just completed the first js variable challenge'
    };
    var data2 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'johndh88@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just completed the first js variable challenge'
    };
    var data3 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'jonathanmartinnyc@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just completed the nested for loop js challenge'
    };
    var data4 = {
        from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
        to: 'johndh88@gmail.com',
        subject: 'Student Progress',
        text: 'Your child or student - ' + player.gamertag + ' - has just completed the nested for loop js challenge'
    };

    var ship = player.getShip();

    ship.position[0] = clamp(starcoder.config.worldBounds[0], x, starcoder.config.worldBounds[2]);
    ship.position[1] = clamp(starcoder.config.worldBounds[3], -y, starcoder.config.worldBounds[1]);

    var currPosX = ship.position[0];
    var currPosY = ship.position[1];

    player.oldWarpCoords.push([currPosX,currPosY]);

    var arrSliced3 = player.oldWarpCoords.slice(player.oldWarpCoords.length-3,player.oldWarpCoords.length);
    var arrSliced4 = player.oldWarpCoords.slice(player.oldWarpCoords.length-4,player.oldWarpCoords.length);
    var arrSliced5 = player.oldWarpCoords.slice(player.oldWarpCoords.length-5,player.oldWarpCoords.length);
    var arrSliced6 = player.oldWarpCoords.slice(player.oldWarpCoords.length-6,player.oldWarpCoords.length);
    var arrSliced7 = player.oldWarpCoords.slice(player.oldWarpCoords.length-7,player.oldWarpCoords.length);
    var arrSliced10 = player.oldWarpCoords.slice(player.oldWarpCoords.length-10,player.oldWarpCoords.length);
    var arrSliced20 = player.oldWarpCoords.slice(player.oldWarpCoords.length-20,player.oldWarpCoords.length);
    var arrSliced21 = player.oldWarpCoords.slice(player.oldWarpCoords.length-21,player.oldWarpCoords.length);
    var arrSliced41 = player.oldWarpCoords.slice(player.oldWarpCoords.length-41,player.oldWarpCoords.length);
    var arrSliced55 = player.oldWarpCoords.slice(player.oldWarpCoords.length-55,player.oldWarpCoords.length);

    var sol1 = [ [ 100, -0 ], [ 200, -0 ], [ 300, -0 ] ];
    var sol21 = [ [ 200, -0 ],
        [ 205, -0 ],
        [ 210, -0 ],
        [ 215, -0 ],
        [ 220, -0 ],
        [ 225, -0 ],
        [ 230, -0 ],
        [ 235, -0 ],
        [ 240, -0 ],
        [ 245, -0 ],
        [ 250, -0 ],
        [ 255, -0 ],
        [ 260, -0 ],
        [ 265, -0 ],
        [ 270, -0 ],
        [ 275, -0 ],
        [ 280, -0 ],
        [ 285, -0 ],
        [ 290, -0 ],
        [ 295, -0 ],
        [ 300, -0 ] ];

    var solNested1 = [
        [ 200, -0 ],
        [ 205, -0 ],
        [ 210, -0 ],
        [ 215, -0 ],
        [ 220, -0 ],
        [ 225, -0 ],
        [ 230, -0 ],
        [ 235, -0 ],
        [ 240, -0 ],
        [ 245, -0 ],
        [ 250, -0 ],
        [ 200, -5 ],
        [ 205, -5 ],
        [ 210, -5 ],
        [ 215, -5 ],
        [ 220, -5 ],
        [ 225, -5 ],
        [ 230, -5 ],
        [ 235, -5 ],
        [ 240, -5 ],
        [ 245, -5 ],
        [ 250, -5 ],
        [ 200, -10 ],
        [ 205, -10 ],
        [ 210, -10 ],
        [ 215, -10 ],
        [ 220, -10 ],
        [ 225, -10 ],
        [ 230, -10 ],
        [ 235, -10 ],
        [ 240, -10 ],
        [ 245, -10 ],
        [ 250, -10 ],
        [ 200, -15 ],
        [ 205, -15 ],
        [ 210, -15 ],
        [ 215, -15 ],
        [ 220, -15 ],
        [ 225, -15 ],
        [ 230, -15 ],
        [ 235, -15 ],
        [ 240, -15 ],
        [ 245, -15 ],
        [ 250, -15 ],
        [ 200, -20 ],
        [ 205, -20 ],
        [ 210, -20 ],
        [ 215, -20 ],
        [ 220, -20 ],
        [ 225, -20 ],
        [ 230, -20 ],
        [ 235, -20 ],
        [ 240, -20 ],
        [ 245, -20 ],
        [ 250, -20 ] ];

    
    
    if(arraysEqual(player.oldWarpCoords, [ [ 100, -0 ], [ 200, -0 ], [ 300, -0 ] ])){
        //console.log("yes array comparison working");
    }



    if(arraysEqual(arrSliced55, solNested1) && player.challenge3 === false) {

        player.challenge3 = true;
        starcoder.updatePlayerScore('Code Challenges', player.id, 15);

        setTimeout(function () {
            starcoder.sendMessage(player, 'challengewon3', 'Wow you solved the nested loop challenge!');
        }, 500);
        player.getShip().crystals += 250;
        if (player.role === 'player') {
            if (player.timestamp_old) {
                if (player.timestamp_old + 5000 < player.timestamp_new) {
                    mailgun.messages().send(data3, function (error, body) {
                    });
                    mailgun.messages().send(data4, function (error, body) {
                    });
                }
            }
            else {
                mailgun.messages().send(data3, function (error, body) {
                });
                mailgun.messages().send(data4, function (error, body) {
                });
            }
            player.timestamp_old = player.timestamp_new;
        }
    }
    

    if(ship.position[0]===200 && ship.position[1]===-0 && player.challenge1===false) {
        player.challenge1 =true;
        starcoder.updatePlayerScore('Code Challenges', player.id, 10);

        setTimeout(function(){
            starcoder.sendMessage(player, 'challengewon1', 'Good job changing the value of the variable!');
        },500);
        player.getShip().crystals += 150;
        if (player.role === 'player') {
            if(player.timestamp_old) {
                if (player.timestamp_old + 5000 < player.timestamp_new) {
                    mailgun.messages().send(data, function (error, body) {
                    });
                    mailgun.messages().send(data2, function (error, body) {
                    });
                }
            }
            else{
                mailgun.messages().send(data, function (error, body) {
                });
                mailgun.messages().send(data2, function (error, body) {
                });
            }
            player.timestamp_old = player.timestamp_new;
        }


    }
};

/**
 * Set heading of player ship
 *
 * @param player
 * @param angle
 */
API.rotate = function (player, angle) {
    player.getShip().angle = angle * D2R;
};

/**
 * Set properties for planted trees
 *
 * @param player {Player}
 * @param trunkLength {number}
 * @param branchFactor {number}
 * @param branchDecay {number}
 * @param spread {number}
 * @param depth {number}
 */
API.setSeederProperties = function (player, trunkLength, branchFactor, branchDecay, spread, depth) {
    var seeder = player.getShip().seederProperties;
    seeder.trunkLength = trunkLength;
    seeder.branchFactor = branchFactor;
    seeder.branchDecay = branchDecay;
    seeder.spread = clamp(30, spread, 160);
    seeder.depth = clamp(1, depth, 5);
};

/**
 * set timer for delayed or repeating actions
 *
 * @param player {Player}
 * @param func {function}
 * @param timeout {number}
 * @param repeat {boolean}
 */
API.setTimer = function (player, func, timeout, repeat) {
    var interpreter = player.interpreter;
    if (repeat) {
        interpreter.intervalCache.push(setInterval(function () {
            interpreter.addEvent(func);
        }, timeout*1000));
    } else {
        interpreter.timeoutCache.push(setTimeout(function () {
            interpreter.addEvent(func);
        }, timeout*1000));
    }
    interpreter.toggleEventLoop(true);
};
//API.setTimer.async = true;

/**
 * End event loop and allow code to exit
 *
 * @param player {Player}
 */
API.cancelEventLoop = function (player) {
    player.interpreter.toggleEventLoop(false);
};

/**
 * Return selected properties of body
 *
 * @param player {Player}
 * @param body {object}
 * @param property {string}
 * @returns {*}
 */
API.getBodyProperty = function (player, body, property) {
    switch (property) {
        case 'x':
        case 'y':
        case 'vx':
        case 'vy':
        case 'id':
            return body[property];
        case 'distance':
            var ship = player.getShip();
            var dx = ship.position[0] - body.x;
            var dy = ship.position[1] - body.y;
            return sqrt(dx*dx+ dy*dy);
    }
};

/**
 * Sort array of bodies by distance from player ship
 * Default is near to far. far to near if reverse is true
 *
 * @param player {Player}
 * @param bodies {Array}
 * @param reverse {boolean}
 * @returns {Array.<T>|string|*|Array|Blob|ArrayBuffer}
 */
API.sortByDistance = function (player, bodies, reverse) {
    var ship = player.getShip();
    var x = ship.position[0];
    var y = ship.position[1];
    var dir = reverse ? -1 : 1;
    var cmp = function (a, b) {
        var da = (a.x - x)*(a.x - x) + (a.y - y)*(a.y - y);
        var db = (b.x - x)*(b.x - x) + (b.y - y)*(b.y - y);
        return dir*(da - db);
    };
    bodies = bodies.slice();
    bodies.sort(cmp);
    return bodies;
};

/**
 * Set player ships heading to face body
 *
 * @param player {Player}
 * @param body {object}
 */
API.pointToBody = function (player, body) {
    if (Array.isArray(body)) {
        body = body[0];
    }
    if (!body) {
        return;
    }
    var ship = player.getShip();
    var dx = ship.position[0] - body.x;
    var dy = ship.position[1] - body.y;
    ship.angle = -atan2(dx, dy);
};

/**
 * console.log wrapper for testing
 *
 * @param player
 * @param msg
 */
API.log = function (player, msg) {
    console.log(msg);
};

/**
 * Turn music on
 *
 * @param player
 */
API.musicOn = function (player) {
    starcoder.sendMessage(player, 'music', 'on');
};

/**
 * Turn music off
 *
 * @param player
 */
API.musicOff = function (player) {
    starcoder.sendMessage(player, 'music', 'off');
};

/**
 * Show grid
 *
 * @param player
 */
API.showGrid = function (player) {
    starcoder.sendMessage(player, 'grid', 'on');
};

/**
 * Hide grid
 *
 * @param player
 */
API.hideGrid = function (player) {
    starcoder.sendMessage(player, 'grid', 'off');
};

/**
 * Show a short text string on the screen
 *
 * @param player
 * @param text {string}
 */
API.alert = function (player, text) {
    starcoder.sendMessage(player, 'alert', text);
};


var messageWhitelist = [
    "nice job!",
    "how did you do that? can you deploy your code?",
    "follow me!",
    "very cool, any other cool code to share?",
    "wow!",
    "bom trabalho!",
    "como você fez isso? você pode implantar seu código?",
    "muito legal, qualquer outro código legal para compartilhar?",
    "Uau!"
];
/**
 * Broadcast message to all players
 *
 * @param player
 * @param msgid {number}
 */
API.broadcast = function (player, msgid) {
    starcoder.broadcastMessage('alert', {tag: player.gamertag, msg: msgid});
};


/**
 * Create StationBlock
 *
 * @param player
 * @param shape
 */
API.createStationBlock = function (player, shape) {
    if (sbCount >= sbLimit) {
        throw new SCError('StationBlock limit reached');
    }
    for (var i = 0, l = shape.length; i < l; i++) {
        shape[i][0] = -shape[i][0];
        shape[i][1] = -shape[i][1];
    }
    _normalizeShape(shape);
    var ship = player.getShip();
    var station = ship.worldapi.addSyncableBody(StationBlock, {shape: shape, vectorScale: 1, mass: 40, owner: player});
    sbCount += 1;
    // FIXME: positioning and error check
    var r = ship.boundingRadius + station.boundingRadius + 1;
    station.position[0] = ship.position[0] + sin(ship.angle) * r;
    station.position[1] = ship.position[1] + -cos(ship.angle) * r;
    player.achieve('createstationblocks');
};

function _normalizeShape (shape) {
    if (shape.length < 3) {
        throw new SCError('Path must contain at least three points');
    } else if (shape.length > sbPoints) {
        throw new SCError('Path is too complex');
    }
    // Check diameter
    var maxx = -Infinity, maxy = -Infinity, minx = Infinity, miny = Infinity;
    for (var i = 0; i < shape.length; i++) {
        shape[i][0] = -shape[i][0];     // Reversing x's due to coordinate weirdness
        maxx = max(maxx, shape[i][0]);
        maxy = max(maxy, shape[i][1]);
        minx = min(minx, shape[i][0]);
        miny = min(miny, shape[i][1]);
    }
    if ((maxx - minx) > sbDiameter || (maxy - miny) > sbDiameter) {
        throw new SCError('Station Block is too big');
    }
    // Reversing x's due to coordinate system weirdness. Should probably be fixed elsewhere but this'll do for now
    // for (i = 0; i < shape.length; i++) {
    //     shape[i][0] = -shape[i][0];
    // }
    // Check to make sure poly isn't self intersecting
    var p = new decomp.Polygon();
    p.vertices = shape;
    if (!p.isSimple()) {
        throw new SCError('Path cannot cross itself');
    }
}


/**
 * Create Turret
 *
 * @param player
 * @param shape
 */
API.createTurret = function (player) {
    var ship = player.getShip();
    var turret = ship.worldapi.addSyncableBody(Turret, {vectorScale: 1, mass: 60, owner: player});
    // FIXME: positioning and error check
    var r = ship.boundingRadius + turret.boundingRadius + 1;
    turret.position[0] = ship.position[0] + sin(ship.angle) * r;
    turret.position[1] = ship.position[1] + -cos(ship.angle) * r;
    turret.angle = ship.angle;
    turret.owner = ship;
    ship.turrets.push(turret);
    return turret;
};


/**
 * Aim turret in direction (0 = turret facing)
 *
 * @param player
 * @param turret
 * @param direction
 */
API.aimTurret = function (player, turret, direction) {
    turret.__body.aim = direction;
};

/**
 * Shoot in direction of turret aim
 *
 * @param player
 * @param turret
 * @param direction
 */
API.fireTurret = function (player, turret) {
    turret.__body.fire();
};

/**
 * Return array of turrets created by player
 *
 * @param player
 * @param val
 * @returns {Array}
 */
API.getTurret = function (player, val) {
    return player.getShip().turrets[val];
};

module.exports = API;
