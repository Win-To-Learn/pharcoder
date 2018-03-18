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
strings['en']['sc_set_critter_genome'] = {};
strings['en']['sc_set_critter_genome']['message0'] = "set critter genome";
strings['en']['sc_set_critter_genome']['message1'] = "head %1";
strings['en']['sc_set_critter_genome']['message2'] = "torso %1";
strings['en']['sc_set_critter_genome']['message3'] = "feet %1";
strings['en']['sc_set_critter_genome']['op0'] = "bird";
strings['en']['sc_set_critter_genome']['op1'] = "horse";
strings['en']['sc_set_critter_genome']['op2'] = "monkey";
strings['en']['sc_set_critter_genome']['op3'] = "penguin";
strings['en']['sc_set_critter_genome']['op4'] = "rat";
strings['en']['sc_set_critter_genome']['op5'] = "t-rex";

// Spanish
categories['es'] = {};
categories['es']['LISTS'] = 'Listas';
categories['es']['VARIABLES'] = 'Variables';
categories['es']['LOOPS'] = 'Bucles';
categories['es']['LOGIC'] = 'Logica';
categories['es']['MATH'] = 'Matematicas';

strings['es'] = {};
strings['es']['sc_set_thrust_power'] = 'establece la fuerza de empuje de la nave en %1';
strings['es']['sc_set_color'] = 'establece el color de la embarcacion %1';
strings['es']['sc_create_station_block'] = 'crea un bloque de estacion con forma %1';
strings['es']['sc_set_turning_power'] = 'establece la fuerza de giro de la nave a %1';
strings['es']['sc_translate'] = 'envia nave espacial a (%1,%2)';
strings['es']['sc_set_scale'] = 'establece escala de la nave a %1';
strings['es']['sc_change_shape'] = 'establece la forma de la nave %1';
strings['es']['sc_turtle_command'] = {};
strings['es']['sc_turtle_command']['fd'] = 'seguir adelante';
strings['es']['sc_turtle_command']['bk'] = 'vuelve atras';
strings['es']['sc_turtle_command']['rt'] = 'gire a la derecha';
strings['es']['sc_turtle_command']['lt'] = 'gira a la izquierda';
strings['es']['sc_directions_to_points'] = 'crea forma a partir de las direcciones %1';
strings['es']['sc_shoot'] = 'dispara laser';
strings['es']['sc_thrust'] = 'Propulsor de fuego a %1';
strings['es']['sc_turn'] = 'vuelta por %1';
strings['es']['sc_set_seeder_props'] = {};
strings['es']['sc_set_seeder_props']['message0'] = 'establece las propiedades de la sembradora';
strings['es']['sc_set_seeder_props']['message1'] = 'Longitud del tronco %1 factor de ramificacion %2 degradacion de ramificacion %3 extension %4 profundidad %5';strings['es']['sc_scan'] = {};
strings['es']['sc_scan'] = {};
strings['es']['sc_scan']['message0'] = 'Escaneo de %1 cercano';
strings['es']['sc_scan']['op0'] = 'otros naves';
strings['es']['sc_scan']['op1'] = 'asteroides ';
strings['es']['sc_scan']['op2'] = 'planetoides';
strings['es']['sc_scan']['op3'] = 'arboles';
strings['es']['sc_scan']['op4'] = 'extranjeros';
strings['es']['sc_scan']['op5'] = 'hidra';
strings['es']['sc_console_log'] = 'log %1 a la consola del servidor';
strings['es']['sc_set_timer'] = {};
strings['es']['sc_set_timer']['message0'] = 'hacer %1 en %2 segundos';
strings['es']['sc_set_timer']['message1'] = 'repetir %1';
strings['es']['sc_get_body_property'] = {};
strings['es']['sc_get_body_property']['message0'] = '%1 de %2';
strings['es']['sc_get_body_property']['op0'] = 'x coordenada';
strings['es']['sc_get_body_property']['op1'] = 'y coordenada';
strings['es']['sc_get_body_property']['op2'] = 'Velocidad de en direccion x';
strings['es']['sc_get_body_property']['op3'] = 'Velocidad de en direccion y';
strings['es']['sc_get_body_property']['op4'] = 'id';
strings['es']['sc_get_body_property']['op5'] = 'Distancia del nave';
strings['es']['sc_sort_by_distance'] = {};
strings['es']['sc_sort_by_distance']['message0'] = 'ordenada %1 por distancia del nave %2';
strings['es']['sc_sort_by_distance']['op0'] = 'cerca de lejos';
strings['es']['sc_sort_by_distance']['op1'] = 'lejos de cerca';
strings['es']['sc_point_to_body'] = 'Buque de punto en %1';
strings['es']['sc_cancel_event_loop'] = 'cancelar evento de bucle';
strings['es']['sc_music_on'] = 'enciende la m˙sica';
strings['es']['sc_music_off'] = 'apaga la musica';
strings['es']['sc_show_grid'] = 'mostrar cuadricula';
strings['es']['sc_hide_grid'] = 'ocultar rejilla';
strings['es']['sc_alert'] = 'mostrar alerta %1';
strings['es']['sc_create_turret'] = 'crea torreta';
strings['es']['sc_fire_turret'] = 'Torreta de fuego %1';
strings['es']['sc_aim_turret'] = {};
strings['es']['sc_aim_turret']['message0'] = 'apunta';
strings['es']['sc_aim_turret']['message1'] = 'Torreta %1 en angulo %2';
strings['es']['sc_get_turrets'] = 'obtener elemento de torreta %1';
strings['es']['sc_broadcast'] = {};
strings['es']['sc_broadcast']['message0'] = 'transmitir %1 mensaje a otros naves';
strings['es']['sc_broadcast']['op0'] = "bom trabalho!";
strings['es']['sc_broadcast']['op1'] = "como você fez isso? você pode implantar seu código?";
strings['es']['sc_broadcast']['op2'] = "me siga!";
strings['es']['sc_broadcast']['op3'] = "muito legal, qualquer outro código legal para compartilhar?";
strings['es']['sc_broadcast']['op4'] = "Uau!";
// TODO: Translate these
strings['es']['sc_set_critter_genome'] = {};
strings['es']['sc_set_critter_genome']['message0'] = "set critter genome";
strings['es']['sc_set_critter_genome']['message1'] = "head %1";
strings['es']['sc_set_critter_genome']['message2'] = "torso %1";
strings['es']['sc_set_critter_genome']['message3'] = "feet %1";
strings['es']['sc_set_critter_genome']['op0'] = "bird";
strings['es']['sc_set_critter_genome']['op1'] = "horse";
strings['es']['sc_set_critter_genome']['op2'] = "monkey";
strings['es']['sc_set_critter_genome']['op3'] = "penguin";
strings['es']['sc_set_critter_genome']['op4'] = "rat";
strings['es']['sc_set_critter_genome']['op5'] = "t-rex";


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
