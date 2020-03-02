const { remote } = require('electron')
const { Menu, MenuItem } = remote
const ChampSelectAPI = require("../index.js")
var api = new ChampSelectAPI()
api.start()
var timerLeft = 0
var timerRight = 0
var namesEditable = false

var menu = new Menu()
menu.append(new MenuItem({ role: 'fileMenu' }))
menu.append(new MenuItem({ role: 'editMenu' }))
menu.append(new MenuItem({ role: 'viewMenu' }))
menu.append(new MenuItem({ role: 'windowMenu' }))
menu.append(new MenuItem({ label: 'Fetch Summoner Names', click() { getNames() } }))
menu.append(new MenuItem({ label: 'Toggle Editable Summonernames', click() { toggleEditableNames() } }))
Menu.setApplicationMenu(menu)

Menu.setApplicationMenu(menu)
api.on('championSelectStarted', (data) => {
    console.log("spec started")
    timerLeft = document.getElementById("timerLeft")
    timerRight = document.getElementById("timerRight")
    gameStarted = true
})

api.on('championHoverChanged', (championId, actorCellId) => {
    var summoner = document.getElementById("summoner" + actorCellId)
    summoner.classList.remove("no-champion")
    summoner.classList.add("is-picking-now");
    summoner.classList.add("champion-not-locked");
    var background = document.querySelector("#summoner" + actorCellId + " .background");
    background.setAttribute("data-id", championId);
    background.setAttribute("style", "background-image:url(images/splash-art/centered/" + championId + ".jpg)");
})

api.on('championChanged', (championId, actorCellId) => {
    var summoner = document.getElementById("summoner" + actorCellId)
    var background = document.querySelector("#summoner" + actorCellId + " .background");
    background.setAttribute("data-id", championId);
    background.setAttribute("style", "background-image:url(images/splash-art/centered/" + championId + ".jpg)");
})

api.on('championLocked', (championId, actorCellId) => {
    var summoner = document.getElementById("summoner" + actorCellId);
    summoner.classList.remove("is-picking-now");
    summoner.classList.remove("champion-not-locked");
    summoner.classList.add("champion-locked")
})


api.on('championBanned', (championId, banTurn) => {
    var ban_wrapper = document.getElementById("ban" + banTurn);
    ban_wrapper.classList.add("completed");
    ban_wrapper.classList.remove("active")
    var ban_icon = document.querySelector("#ban" + banTurn + " .ban")
    if (championId != 0) {
        ban_icon.setAttribute("style", "background-image:url(images/splash-art/centered/" + championId + ".jpg)")
        ban_icon.setAttribute("data-id", championId)
    }
})


api.on('phaseChanged', (newType) => {

    console.log("phase changed to:" + newType)
    var main = document.getElementsByClassName("champ-select-spectate-component")[0]
    curPhase++
    var phase = document.getElementsByClassName("phase")[0]
    phase.innerHTML = phases[curPhase]
    if (curPhase == 4) {
        main.classList.remove("left-side-acting")
        main.classList.remove("right-side-acting")
        main.classList.add("show-both-timers")
    }
})

api.on('playerTurnBegin', (actorCellId) => {
    var summoner = document.getElementById("summoner" + actorCellId);
    summoner.classList.add("is-picking-now");
})

api.on('banTurnBegin', (banTurn) => {
    var ban_wrapper = document.getElementById("ban" + banTurn);
    ban_wrapper.classList.add("active");
})

api.on('playerTurnEnd', (actorCellId) => {
    //TODO add fancy animations
})

api.on('banTurnEnd', (banTurn) => {
    //TODO fancy animations
})

api.on('newTurnBegin', (timeLeftInSec) => {
    console.log("reset timer")
    t = timeLeftInSec
})

api.on('teamTurnChanged', (isAllyAction) => {
    var main = document.getElementsByClassName("champ-select-spectate-component")[0]
    if (isAllyAction) {
        main.classList.add("left-side-acting")
        main.classList.remove("right-side-acting")
    }
    else {
        main.classList.remove("left-side-acting")
        main.classList.add("right-side-acting")
    }
})

api.on('summonerSpellChanged', (actorCellId, spellIndex, spellId) => {
    var summonerSpell = document.querySelector("#summoner" + actorCellId + " .spell:nth-child(" + spellIndex + ")")
    summonerSpell.setAttribute("src", "images/summoner-spells/" + spellId + ".png")
})

var curPhase = 0
var phases = ['Ban Phase 1', 'Picking Phase 1', 'Ban Phase 2', 'Picking Phase 2', '']
var gameStarted = false
var t = 30
var x = setInterval(function () {
    if (t != 0 && gameStarted) {
        t -= 1
        if (t < 10) {
            timerLeft.innerHTML = ":0" + t
            timerRight.innerHTML = ":0" + t
        } else {
            timerLeft.innerHTML = ":" + t
            timerRight.innerHTML = ":" + t
        }
    }
}, 1000)

function getNames() {
    api.request("lol-lobby/v2/lobby", a)
}

function a(response) {
    var b = JSON.parse(response)
    console.log(b)
    var blueTeam = b.gameConfig.customTeam100
    var redTeam = b.gameConfig.customTeam200
    var i;
    for (i = 0; i < blueTeam.length; i++) {
        var id = i * 2
        var name = document.querySelector("#summoner" + id + " .summoner-name")
        name.innerHTML = blueTeam[i].summonerName
    }
    for (i = 0; i < redTeam.length; i++) {
        var id = (i * 2) + 1
        var name = document.querySelector("#summoner" + id + " .summoner-name")
        name.innerHTML = redTeam[i].summonerName
    }
}

function toggleEditableNames() {
    names = document.getElementsByClassName("summoner-name")
    namesEditable = !namesEditable
    for (let name of names) {
        name.setAttribute("contenteditable", namesEditable)
    }
}