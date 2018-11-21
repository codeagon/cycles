/* global __dirname */

const path = require('path')
const fs = require('fs')


let BadGui

try {
    BadGui = require('badGui')
} catch (e) {
    try {
        BadGui = require('badGui-master')
    } catch (e) {
        console.log(`[Cycles] - badGUI not installed, GUI functionality disabled, please see the readme for more information`)
    }
}

const aList = require('./aes.json')

const skySet = require('./preset.json')




module.exports = function Cycles(mod) {
    const command = mod.command || mod.require.command
    let count = 1,
        bleb,
        gui,
        nextName,
        useGui = false,
        deAeroNextRun = false,
        nextAero = [],
        usedAeros = [],
        config

    try {
        gui = new BadGui(mod)
        useGui = true
    } catch (e) {
        useGui = false
        console.log(`[Cycles] - badGUI not installed, GUI functionality disabled, please see the readme for more information`)
    }
    // heuheuea
    //7200000 MS (43200000/aeroNum) per would be real-like I guess??????
    try {
        config = require('./config.json')
    } catch (e) {
        config = {
            onMapChange: false,
            changeEveryTp: false,
            cycleTime: 120000,
            version: "1"
        }
        saveConfig()
    }

    if (config.version !== "1") {
        Object.assign(config, {
            "changeEveryTp": false,
            cycleTime: 120000,
            version: "1"
        })
        saveConfig()
    }


    mod.hook('C_LOAD_TOPO_FIN', 1, () => {
        if (config.onMapChange) {
            bleb = setInterval(timer, config.cycleTime)
        }
    })

    function randBool() {
        return Boolean(Math.random() < 0.5); //use a config for this
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function aeroSwitch(arg) {
        console.log(count)
        for (let i in skySet) {
            if (skySet[i].time == arg && !usedAeros.includes(skySet[i].name)) {
                nextAero.push(skySet[i].name) //shove this in an array because I'm too dumb to figure out a better way
            }
        }
        nextName = nextAero[rand(0, nextAero.length)]
        //nextName = [Math.floor(Math.random() * nextAero.length)];
        usedAeros.push(nextName)
        console.log(nextName)
        mod.send('S_AERO', 1, {
            enabled: 1,
            blendTime: 110, //time it takes to transition between thingies, probably too high
            aeroSet: nextName
        })
        count++
        nextAero = []
    }

    function timer() {
        if (count >= 5 && deAeroNextRun) {
            deAeroNextRun = false
            deAero()
            usedAeros = []
            count = 1
            aeroSwitch(count)
            return
        }
        if (count >= 5) {
            count = 1
            aeroSwitch(count)
            deAeroNextRun = true
            return
        }

        /*if (randBool()) {
            console.log('weathertime')
            mod.send('S_AERO', 1, {
                enabled: 1,
                blendTime: 120, //time it takes to transition between thingies, probably too high
                aeroSet: weather[rand(1, 4)]
            })
            aeroSwitch(count)
        } else {*/

        aeroSwitch(count)
    }


    function deAero() {
        mod.send('S_SPAWN_NPC', 10, {
            gameId: 8989898989,
            templateId: 30210000, // ♥ ♥ ♥ :cuteboi: to the rescue ♥ ♥ ♥
            huntingZoneId: 1000,
            spawnScript: 105,
            visible: true
        })
    }


    function handleGui(page, arg) {
        switch (page) {
            default:
                console.log('aaaAA')
        }
    }

    command.add('cycle', (cmd, arg) => {
        switch (cmd) {
            case 'gui':
                if (useGui) {
                    handleGui(arg)
                }
                break
            case 't':
                console.log(aList[arg])
                mod.send('S_AERO', 1, {
                    enabled: 1,
                    blendTime: 1, //time it takes to transition between thingies, probably too high
                    aeroSet: aList[arg]
                })
                break
            case "on":
            case "enable":
            case "activate":
                command.message('Time cycles activated.')
                bleb = setInterval(timer, config.cycleTime) // takes TWO whole minutes!!! Seems like a good time
                break
            case "off":
            case "stop":
            case "disable":
            case "deactivate": //~todo thesaurus for every single word in the English language for off and on
                command.message('Time Cycles Deactivating and reverting')
                clearInterval(bleb)
                deAero()
                break
            case "restart":
            case "reset":
                deAero()
                count = 0
                bleb = setInterval(timer, config.cycleTime)
                break
            case "timer":
            case "time":
                bleb = setInterval(timer, arg)
                command.message(`Timer interval set to ${arg}ms`)
                break
            default:
                command.message(`Incorrect command entered!`)
        }
    })


    //eheheheahEHehaehueh

    function saveConfig() {
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(
            config, null, 4), () => {
                console.log('[[Cycles]] - Config file saved, uguu~')
            })
    }

    this.destructor = () => {
        command.remove('cycle') // since this doesn't need anything we can do reloading stuff
    }
}
