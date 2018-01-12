/**
 * Translations.js
 *
 * Created by jay on 1/12/18
 */

let lang = 'en';

let strings = {};
let categories = {};

// English
categories['en'] = {};
categories['en']['LISTS'] = 'Lists';
categories['en']['VARIABLES'] = 'Variables';
categories['en']['LOOPS'] = 'Loops';
categories['en']['LOGIC'] = 'Logic';
categories['en']['MATH'] = 'Math';

strings['en'] = {};
strings['en']['sc_set_thrust_power'] = 'set ship thrust force to %1';
strings['en']['sc_set_color'] = 'set ship color %1';
strings['en']['sc_create_station_block'] = 'create station block with shape %1';
strings['en']['sc_set_turning_power'] = 'set ship turning force to %1';
strings['en']['sc_translate'] = 'warp ship to (%1,%2)';
strings['en']['sc_set_scale'] = 'set ship scale to %1';
strings['en']['sc_change_shape'] = 'set ship shape %1';
strings['en']['sc_turtle_command'] = {};
strings['en']['sc_turtle_command']['fd'] = 'go forward';
strings['en']['sc_turtle_command']['bk'] = 'go back';
strings['en']['sc_turtle_command']['rt'] = 'turn right';
strings['en']['sc_turtle_command']['lt'] = 'turn left';
strings['en']['sc_directions_to_points'] = 'create shape from directions %1';
strings['en']['sc_shoot'] = 'shoot laser';
strings['en']['sc_thrust'] = 'fire thruster to %1';
strings['en']['sc_turn'] = 'turn by %1';
strings['en']['sc_set_seeder_props'] = {};
strings['en']['sc_set_seeder_props']['message0'] = 'set seeder properties';
strings['en']['sc_set_seeder_props']['message1'] = 'trunk length %1 branch factor %2 branch decay %3 spread %4 depth %5';
strings['en']['sc_scan'] = {};
strings['en']['sc_scan']['message0'] = 'scan of %1 nearby';
strings['en']['sc_scan']['op0'] = 'other ships';
strings['en']['sc_scan']['op1'] = 'asteroids';
strings['en']['sc_scan']['op2'] = 'planetoids';
strings['en']['sc_scan']['op3'] = 'trees';
strings['en']['sc_scan']['op4'] = 'aliens';
strings['en']['sc_scan']['op5'] = 'hydra';
strings['en']['sc_console_log'] = 'log %1 to server console';
strings['en']['sc_set_timer'] = {};
strings['en']['sc_set_timer']['message0'] = 'do %1 in %2 seconds';
strings['en']['sc_set_timer']['message1'] = 'repeat %1';
strings['en']['sc_get_body_property'] = {};
strings['en']['sc_get_body_property']['message0'] = '%1 of %2';
strings['en']['sc_get_body_property']['op0'] = 'x coordinate';
strings['en']['sc_get_body_property']['op1'] = 'y coordinate';
strings['en']['sc_get_body_property']['op2'] = 'velocity in x direction';
strings['en']['sc_get_body_property']['op3'] = 'velocity in y direction';
strings['en']['sc_get_body_property']['op4'] = 'id';
strings['en']['sc_get_body_property']['op5'] = 'distance from ship';
strings['en']['sc_sort_by_distance'] = {};
strings['en']['sc_sort_by_distance']['message0'] = 'sort %1 by distance from ship %2';
strings['en']['sc_sort_by_distance']['op0'] = 'near to far';
strings['en']['sc_sort_by_distance']['op1'] = 'far to near';
strings['en']['sc_point_to_body'] = 'point ship at %1';
strings['en']['sc_cancel_event_loop'] = 'cancel event loop';
strings['en']['sc_music_on'] = 'turn music on';
strings['en']['sc_music_off'] = 'turn music off';
strings['en']['sc_show_grid'] = 'show grid';
strings['en']['sc_hide_grid'] = 'hide grid';
strings['en']['sc_alert'] = 'show alert %1';
strings['en']['sc_create_turret'] = 'create turret';
strings['en']['sc_fire_turret'] = 'fire turret %1';
strings['en']['sc_aim_turret'] = {};
strings['en']['sc_aim_turret']['message0'] = 'aim';
strings['en']['sc_aim_turret']['message1'] = 'turret %1 at angle %2';
strings['en']['sc_get_turrets'] = 'get turret element %1';
strings['en']['sc_broadcast'] = {};
strings['en']['sc_broadcast']['message0'] = 'broadcast %1 message to other ships';
strings['en']['sc_broadcast']['op0'] = "nice job!";
strings['en']['sc_broadcast']['op1'] = "how did you do that? can you deploy your code?";
strings['en']['sc_broadcast']['op2'] = "follow me!";
strings['en']['sc_broadcast']['op3'] = "very cool, any other cool code to share?";
strings['en']['sc_broadcast']['op4'] = "wow!";

// Spanish (not really at this point)
categories['es'] = {};
categories['es']['LISTS'] = 'SP Lists';
categories['es']['VARIABLES'] = 'SP Variables';
categories['es']['LOOPS'] = 'SP Loops';
categories['es']['LOGIC'] = 'SP Logic';
categories['es']['MATH'] = 'SP Math';

strings['es'] = {};
strings['es']['sc_set_thrust_power'] = 'SP set ship thrust force to %1';
strings['es']['sc_set_color'] = 'SP set ship color %1';
strings['es']['sc_create_station_block'] = 'SP create station block with shape %1';
strings['es']['sc_set_turning_power'] = 'SP set ship turning force to %1';
strings['es']['sc_translate'] = 'SP warp ship to (%1,%2)';
strings['es']['sc_set_scale'] = 'SP set ship scale to %1';
strings['es']['sc_change_shape'] = 'SP set ship shape %1';
strings['es']['sc_turtle_command'] = {};
strings['es']['sc_turtle_command']['fd'] = 'SP go forward';
strings['es']['sc_turtle_command']['bk'] = 'SP go back';
strings['es']['sc_turtle_command']['rt'] = 'SP turn right';
strings['es']['sc_turtle_command']['lt'] = 'SP turn left';
strings['es']['sc_directions_to_points'] = 'SP create shape from directions %1';
strings['es']['sc_shoot'] = 'SP shoot laser';
strings['es']['sc_thrust'] = 'SP fire thruster to %1';
strings['es']['sc_turn'] = 'SP turn by %1';
strings['es']['sc_set_seeder_props'] = {};
strings['es']['sc_set_seeder_props']['message0'] = 'SP set seeder properties';
strings['es']['sc_set_seeder_props']['message1'] = 'SP trunk length %1 branch factor %2 branch decay %3 spread %4 depth %5';
strings['es']['sc_scan'] = {};
strings['es']['sc_scan']['message0'] = 'SP scan of %1 nearby';
strings['es']['sc_scan']['op0'] = 'SP other ships';
strings['es']['sc_scan']['op1'] = 'SP asteroids';
strings['es']['sc_scan']['op2'] = 'SP planetoids';
strings['es']['sc_scan']['op3'] = 'SP trees';
strings['es']['sc_scan']['op4'] = 'SP aliens';
strings['es']['sc_scan']['op5'] = 'SP hydra';
strings['es']['sc_console_log'] = 'SP log %1 to server console';
strings['es']['sc_set_timer'] = {};
strings['es']['sc_set_timer']['message0'] = 'SP do %1 in %2 seconds';
strings['es']['sc_set_timer']['message1'] = 'SP repeat %1';
strings['es']['sc_get_body_property'] = {};
strings['es']['sc_get_body_property']['message0'] = 'SP %1 of %2';
strings['es']['sc_get_body_property']['op0'] = 'SP x coordinate';
strings['es']['sc_get_body_property']['op1'] = 'SP y coordinate';
strings['es']['sc_get_body_property']['op2'] = 'SP velocity in x direction';
strings['es']['sc_get_body_property']['op3'] = 'SP velocity in y direction';
strings['es']['sc_get_body_property']['op4'] = 'SP id';
strings['es']['sc_get_body_property']['op5'] = 'SP distance from ship';
strings['es']['sc_sort_by_distance'] = {};
strings['es']['sc_sort_by_distance']['message0'] = 'SP sort %1 by distance from ship %2';
strings['es']['sc_sort_by_distance']['op0'] = 'SP near to far';
strings['es']['sc_sort_by_distance']['op1'] = 'SP far to near';
strings['es']['sc_point_to_body'] = 'SP point ship at %1';
strings['es']['sc_cancel_event_loop'] = 'SP cancel event loop';
strings['es']['sc_music_on'] = 'SP turn music on';
strings['es']['sc_music_off'] = 'SP turn music off';
strings['es']['sc_show_grid'] = 'SP show grid';
strings['es']['sc_hide_grid'] = 'SP hide grid';
strings['es']['sc_alert'] = 'SP show alert %1';
strings['es']['sc_create_turret'] = 'SP create turret';
strings['es']['sc_fire_turret'] = 'SP fire turret %1';
strings['es']['sc_aim_turret'] = {};
strings['es']['sc_aim_turret']['message0'] = 'SP aim';
strings['es']['sc_aim_turret']['message1'] = 'SP turret %1 at angle %2';
strings['es']['sc_get_turrets'] = 'SP get turret element %1';
strings['es']['sc_broadcast'] = {};
strings['es']['sc_broadcast']['message0'] = 'SP broadcast %1 message to other ships';
strings['es']['sc_broadcast']['op0'] = "bom trabalho!";
strings['es']['sc_broadcast']['op1'] = "como você fez isso? você pode implantar seu código?";
strings['es']['sc_broadcast']['op2'] = "me siga!";
strings['es']['sc_broadcast']['op3'] = "muito legal, qualquer outro código legal para compartilhar?";
strings['es']['sc_broadcast']['op4'] = "Uau!";


let Translations = {
    setLanguage: function (newlang) {
        lang = newlang;
    },

    getString: function (component, key) {
        if (!key) {
            return strings[lang][component];
        } else {
            return strings[lang][component][key];
        }
    },

    getCategory: function (key) {
        return categories[lang][key];
    }
};

module.exports = Translations;
