/* global __dirname */

const Command = require('command');
const GameState = require('tera-game-state');
const path = require('path');
const fs = require('fs');

const aero = ["VK_Aeroset.VK_SkyCastle00_AERO", "aen_aeroset.AERO.Serpent_Island_AERO_FINAL", //add or change things to this if you want
    "aen_aeroset.AERO.AEN_C_Misty_Island_Outdoor_AERO", "RNW_Aeroset_Various.AERO.Sunset_AERO",
    "atw_aeroset.AERO.SPR_Dawn_Garden_02_AERO", "lobby_ch_select_aero.AERO.Lobby_CH_Select_AERO_Night_02"
];

module.exports = function Cycles(dispatch) {
    const command = Command(dispatch);
    const game = GameState(dispatch); //maintaining our status as a reloadable mod is important
    let count = 0,
            bleb;
    // heuheuea
    //7200000 MS (43200000/aeroNum) per would be real-like I guess??????
    try {
        var config = require('./config.json');
    } catch (e) {
        var config = {
            onMapChange: false,
            changeEveryTp: false,
            cycleTime: 120000,
            version: "1"
        };
        saveConfig();
    }

    if (config.version !== "1") {
        Object.assign(config, {
            "changeEveryTp": false,
            cycleTime: 120000,
            version: "1"
        });
        saveConfig();
    }


    dispatch.hook('C_LOAD_TOPO_FIN', 1, (event) => {
        if (config.onMapChange) {
            bleb = setInterval(timer, config.cycleTime);
        }
    });

    function aeroSwitch(arg) {
        dispatch.toClient('S_AERO', 1, {
            enabled: 1,
            blendTime: 120, //time it takes to transition between thingies, probably too high
            aeroSet: aero[arg]
        });
        count++;
    }

    function timer() {
        if (count !== aero.length) { // check if the current count is more than the amount of AEROs in the list
            aeroSwitch(count);
        } else {
            count = 0;
        }
    }

    command.add('cycle', (arg, arg2, arg3) => {
        switch (arg) {
            case "on":
            case "enable":
            case "activate":
                command.message('Time cycles activated.');
                bleb = setInterval(timer, config.cycleTime); // takes TWO whole minutes!!! Seems like a good time
                break;
            case "off":
            case "disable":
            case "deactivate": //todo thesaurus for every single word in the English language for off and on
                command.message('Time Cycles Deactivating and reverting');
                dispatch.toClient('S_START_ACTION_SCRIPT', 3, {
                    gameId: game.me.gameId,
                    script: 105
                });
                clearInterval(bleb);
                break;
            case "restart":
            case "reset":
                dispatch.toClient('S_START_ACTION_SCRIPT', 3, {
                    gameId: game.me.gameId,
                    script: 105
                });
                count = 0;
                bleb = setInterval(timer, config.cycleTime);
                break;
            case "timer":
            case "time":
                bleb = setInterval(timer, arg2);
                command.message(`Timer interval set to ${arg2}ms`);
                break
        }
    });


    //eheheheahEHehaehueh

    function saveConfig() {
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(
                config, null, 4), err => {
            console.log('[[Cycles]] - Config file generated, uguu~');
        });
    }

    this.destructor = () => {
        command.remove('cycle'); // since this doesn't need anything we can do reloading stuff
    };
};
