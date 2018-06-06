const Command = require('command');
const aero = ["VK_Aeroset.VK_SkyCastle00_AERO", "aen_aeroset.AERO.Serpent_Island_AERO_FINAL", //add or change things to this if you want
    "aen_aeroset.AERO.AEN_C_Misty_Island_Outdoor_AERO", "RNW_Aeroset_Various.AERO.Sunset_AERO",
    "atw_aeroset.AERO.SPR_Dawn_Garden_02_AERO", "lobby_ch_select_aero.AERO.Lobby_CH_Select_AERO_Night_02"];

module.exports = function Cycles(dispatch) {
    const command = Command(dispatch);
    let count = 0;

    function aeroSwitch(arg) {
        dispatch.toClient('S_AERO', 1, {
            enabled: 1,
            blendTime: 120,//time it takes to transition between thingies, probably too high
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
        command.message('Time cycles activated.');
        bleb = setInterval(timer, 120000); // takes TWO whole minutes!!! Seems like a good time
    });

    this.destructor = () => {
        command.remove('cycle'); // since this doesn't need anything we can do reloading stuff
    };
};