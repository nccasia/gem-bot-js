// REQUEST command
const SWAP_GEM = "Battle.SWAP_GEM";
const USE_SKILL = "Battle.USE_SKILL";
const SURRENDER = "Battle.SURRENDER";
const FINISH_TURN = "Battle.FINISH_TURN";
const I_AM_READY = "Battle.I_AM_READY";

const LOBBY_FIND_GAME = "LOBBY_FIND_GAME";
const PLAYER_JOINED_GAME = "PLAYER_JOINED_GAME";

// RESPONSE command
const LEAVE_ROOM = "LEAVE_ROOM";
const START_GAME = "START_GAME";
const END_GAME = "END_GAME";
const START_TURN = "START_TURN";
const END_TURN = "END_TURN";

const ON_SWAP_GEM = "ON_SWAP_GEM";
const ON_PLAYER_USE_SKILL = "ON_PLAYER_USE_SKILL";

const BATTLE_MODE = "BATTLE_MODE";

const ENEMY_PLAYER_ID = 0;
const BOT_PLAYER_ID = 2;

const delaySwapGem = 2000;
const delayFindGame = 5000;
const AIR_SPIRIT_MAXATTACK = 14;

var sfs;
var room;

var botPlayer;
var enemyPlayer;
var currentPlayerId;
var grid;

const username = "amen";
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwaGkubGVraW0iLCJhdXRoIjoiUk9MRV9VU0VSIiwiTEFTVF9MT0dJTl9USU1FIjoxNjUzNTU3NzAzODQ1LCJleHAiOjE2NTUzNTc3MDN9.yN78wH8k4eOp397FPQpded0qGodRNyx19p1CbQpQ6oPlVk-CGvRWtl-V06Y_9wx-Xska9RaAmDM7dEWE1wJymA";
var visualizer = new Visualizer({ el: '#visual' });
var params = window.params;
var strategy = window.strategy;
visualizer.start();

// Connect to Game server
initConnection();

if (params.username) {
    document.querySelector('#accountIn').value = params.username;
}

function initConnection() {
    document.getElementById("log").innerHTML = "";

    trace("Connecting...");

    // Create configuration object
    var config = {};
    config.host = "172.16.100.112";
    config.port = 8080;
    // config.host = "10.10.10.18";
    // config.port = 8888;
    //config.debug = true;
    config.useSSL = false;

    // Create SmartFox client instance
    sfs = new SFS2X.SmartFox(config);

    // Set logging
    sfs.logger.level = SFS2X.LogLevel.INFO;
    sfs.logger.enableConsoleOutput = true;
    sfs.logger.enableEventDispatching = true;

    sfs.logger.addEventListener(SFS2X.LoggerEvent.DEBUG, onDebugLogged, this);
    sfs.logger.addEventListener(SFS2X.LoggerEvent.INFO, onInfoLogged, this);
    sfs.logger.addEventListener(SFS2X.LoggerEvent.WARNING, onWarningLogged, this);
    sfs.logger.addEventListener(SFS2X.LoggerEvent.ERROR, onErrorLogged, this);

    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

    sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, onLoginError, this);
    sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);

    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, OnRoomJoin, this);
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, OnRoomJoinError, this);
    sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, OnExtensionResponse, this);

    // Attempt connection
    sfs.connect();
}

function onDisconnectBtClick() {
    // Log message
    trace("Disconnecting...");

    // Disconnect
    sfs.disconnect();
}

//------------------------------------
// LOGGER EVENT HANDLERS
//------------------------------------

function onDebugLogged(event) {
    trace(event.message, "DEBUG", true);
}

function onInfoLogged(event) {
    trace(event.message, "INFO", true);
}

function onWarningLogged(event) {
    trace(event.message, "WARN", true);
}

function onErrorLogged(event) {
    trace(event.message, "ERROR", true);
}

//------------------------------------
// SFS EVENT HANDLERS
//------------------------------------

function onConnection(event) {
    if (event.success) {
        trace("Connected to SmartFoxServer 2X!<br>SFS2X API version: " + sfs.version + "<br> IP: " + sfs.config.host);
    } else {
        trace("Connection failed: " + (event.errorMessage ? event.errorMessage + " (" + event.errorCode + ")" : "Is the server running at all?"));

        // Reset
        reset();
    }
}

function onConnectionLost(event) {
    trace("Disconnection occurred; reason is: " + event.reason);

    reset();
}

//------------------------------------
// OTHER METHODS
//------------------------------------

function trace(message, prefix, isDebug) {
    var text = document.getElementById("log").innerHTML;

    var open = "<div" + (isDebug ? " class='debug'" : "") + ">" + (prefix ? "<strong>[SFS2X " + prefix + "]</strong><br>" : "");
    var close = "</div>";

    if (isDebug)
        message = "<pre>" + message.replace(/(?:\r\n|\r|\n)/g, "<br>") + "</pre>";

    const log = text + open + message + close;
    document.getElementById("log").innerHTML = log;
    visualizer.log(log);
}



function reset() {
    // Remove SFS2X listeners
    sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION, onConnection);
    sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost);

    sfs.logger.removeEventListener(SFS2X.LoggerEvent.DEBUG, onDebugLogged);
    sfs.logger.removeEventListener(SFS2X.LoggerEvent.INFO, onInfoLogged);
    sfs.logger.removeEventListener(SFS2X.LoggerEvent.WARNING, onWarningLogged);
    sfs.logger.removeEventListener(SFS2X.LoggerEvent.ERROR, onErrorLogged);

    sfs = null;
}

function onLoginBtnClick() {
    let uName = username || document.querySelector('#accountIn').value;
    trace("Try login as " + uName);

    let data = new SFS2X.SFSObject();
    data.putUtfString("BATTLE_MODE", "NORMAL");
    data.putUtfString("ID_TOKEN", token);
    data.putUtfString("NICK_NAME", uName);

    var isSent = sfs.send(new SFS2X.LoginRequest(uName, "", data, "gmm"));

    if (isSent) trace("Sent");
}

function onLoginError(event) {
    var error = "Login error: " + event.errorMessage + " (code " + event.errorCode + ")";
    trace(error);
}

function onLogin(event) {
    trace("Login successful!" +
        "\n\tZone: " + event.zone +
        "\n\tUser: " + event.user);

    document.getElementById("loginBtn").style.visibility = "hidden";
    document.getElementById("findBtn").style.visibility = "visible";
}

function findGame() {
    var data = new SFS2X.SFSObject();
    data.putUtfString("type", "");
    data.putUtfString("adventureId", "");
    sfs.send(new SFS2X.ExtensionRequest("LOBBY_FIND_GAME", data));
}

function OnRoomJoin(event) {
    trace("OnRoomJoin " + event.room.name);

    room = event.room;
}

function OnRoomJoinError(event) {
    trace("OnRoomJoinError");
    console.error(event);
}

function OnExtensionResponse(event) {
    let evtParam = event.params;
    var cmd = event.cmd;
    trace("OnExtensionResponse " + cmd);

    switch (cmd) {
        case "START_GAME":
            let gameSession = evtParam.getSFSObject("gameSession");
            StartGame(gameSession, room);
            break;
        case "END_GAME":
            EndGame();
            break;
        case "START_TURN":
            StartTurn(evtParam);
            break;
        case "ON_SWAP_GEM":
            SwapGem(evtParam);
            break;
        case "ON_PLAYER_USE_SKILL":
            HandleGems(evtParam);
            break;
        case "PLAYER_JOINED_GAME":
            sfs.send(new SFS2X.ExtensionRequest(I_AM_READY, new SFS2X.SFSObject(), room));
            break;
    }
}

function StartGame(gameSession, room) {
    // Assign Bot player & enemy player
    AssignPlayers(room);

    // Player & Heroes
    let objBotPlayer = gameSession.getSFSObject(botPlayer.displayName);
    let objEnemyPlayer = gameSession.getSFSObject(enemyPlayer.displayName);

    let botPlayerHero = objBotPlayer.getSFSArray("heroes");
    let enemyPlayerHero = objEnemyPlayer.getSFSArray("heroes");

    for (let i = 0; i < botPlayerHero.size(); i++) {
        botPlayer.heroes.push(new Hero(botPlayerHero.getSFSObject(i)));
    }

    for (let i = 0; i < enemyPlayerHero.size(); i++) {
        enemyPlayer.heroes.push(new Hero(enemyPlayerHero.getSFSObject(i)));
    }

    // Gems
    grid = new Grid(gameSession.getSFSArray("gems"), null, botPlayer.getRecommendGemType());
    currentPlayerId = gameSession.getInt("currentPlayerId");
    trace("StartGame ");

    // log("grid :" , grid);

    // SendFinishTurn(true);
    //taskScheduler.schedule(new FinishTurn(true), new Date(System.currentTimeMillis() + delaySwapGem));
    //TaskSchedule(delaySwapGem, _ => SendFinishTurn(true));

    setTimeout(function () { SendFinishTurn(true) }, delaySwapGem);
    visualizer.setGame({
        game: gameSession,
        grid,
        botPlayer,
        enemyPlayer,
    });
    if (strategy) {

        strategy.setGame({
            game: gameSession,
            grid,
            botPlayer,
            enemyPlayer,
        });

        strategy.addSwapGemHandle(SendSwapGem);
        strategy.addCastSkillHandle(SendCastSkill);
    }

}


function AssignPlayers(room) {

	let users = room.getPlayerList();

	let user1 = users[0];

	let arrPlayerId1 = Array.from(user1._playerIdByRoomId).map(([name, value]) => (value));
	let playerId1 = arrPlayerId1.length > 1 ? arrPlayerId1[1] : arrPlayerId1[0];


	log("id user1: " + playerId1);

	log("users.length : " + users.length);

	if (users.length == 1) {
		if (user1.isItMe) {

			botPlayer = new Player(playerId1, "player1");
			enemyPlayer = new Player(ENEMY_PLAYER_ID, "player2");
		} else {
			botPlayer = new Player(BOT_PLAYER_ID, "player2");
			enemyPlayer = new Player(ENEMY_PLAYER_ID, "player1");
		}
		return;
	}


	let user2 = users[1];

	let arrPlayerId2 = Array.from(user2._playerIdByRoomId).map(([name, value]) => (value));
	let playerId2 = arrPlayerId2.length > 1 ? arrPlayerId2[1] : arrPlayerId2[0];


	log("id user2: " + playerId2);

	log("id user1: " + playerId1);

	if (user1.isItMe) {
		botPlayer = new Player(playerId1, "player" + playerId1);
		enemyPlayer = new Player(playerId2, "player" + playerId2);
	}
	else {
		botPlayer = new Player(playerId2, "player" + playerId2);
		enemyPlayer = new Player(playerId1, "player" + playerId1);
	}


}

function EndGame() {
    isJoinGameRoom = false;

    document.getElementById("log").innerHTML = "";
    visualizer.snapShot();
}


function SendFinishTurn(isFirstTurn) {
    let data = new SFS2X.SFSObject();
    data.putBool("isFirstTurn", isFirstTurn);
    log("sendExtensionRequest()|room:" + room.name + "|extCmd:" + FINISH_TURN + " first turn " + isFirstTurn);
    trace("sendExtensionRequest()|room:" + room.name + "|extCmd:" + FINISH_TURN + " first turn " + isFirstTurn);

    SendExtensionRequest(FINISH_TURN, data);

}


function StartTurn(param) {
	setTimeout(function() {
		visualizer.snapShot();
		currentPlayerId = param.getInt("currentPlayerId");
		if (!isBotTurn()) {
			trace("not isBotTurn");
			return;
		}

		if (strategy) {
			strategy.playTurn();
			return;
		}
        let botPlayerHerosFullMana = botPlayer.allHeroFullMana();
        if (botPlayerHerosFullMana != null) {
            HandleCastSkill(botPlayerHerosFullMana);
        } else {
            let recommendSwapGemIndex = HandleSwapGems();
            SendSwapGem(recommendSwapGemIndex);
        }

    }, delaySwapGem);
}

function isBotTurn() {
    return botPlayer.playerId == currentPlayerId;
}


function SendCastSkill(heroCastSkill, { targetId, selectedGem, gemIndex, isTargetAllyOrNot } = {}) {
	var data = new SFS2X.SFSObject();

	data.putUtfString("casterId", heroCastSkill.id.toString());
	if (targetId) {
		data.putUtfString("targetId", targetId);
	} else if (heroCastSkill.isHeroSelfSkill()) {
		data.putUtfString("targetId", botPlayer.firstHeroAlive().id.toString());
	} else {
		data.putUtfString("targetId", enemyPlayer.firstHeroAlive().id.toString());
	}
	console.log("selectedGem:  ", SelectGem());
	if (selectedGem) {
		data.putUtfString("selectedGem", selectedGem);
	} {
		data.putUtfString("selectedGem", SelectGem().toString());
	}
	if (gemIndex) {
		data.putUtfString("gemIndex", gemIndex);
	} {
		data.putUtfString("gemIndex", GetRandomInt(64).toString());
	}

	if (isTargetAllyOrNot) {
		data.putBool("isTargetAllyOrNot", isTargetAllyOrNot);
	} else {
		data.putBool("isTargetAllyOrNot", false);
	}
	log("sendExtensionRequest()|room:" + room.Name + "|extCmd:" + USE_SKILL + "|Hero cast skill: " + heroCastSkill.name);
	trace("sendExtensionRequest()|room:" + room.Name + "|extCmd:" + USE_SKILL + "|Hero cast skill: " + heroCastSkill.name);

	SendExtensionRequest(USE_SKILL, data);

}

function SendSwapGem(swap) {
    let indexSwap = swap ?? grid.recommendSwapGem();

	log("sendExtensionRequest()|room:" + room.Name + "|extCmd:" + SWAP_GEM + "|index1: " + indexSwap[0] + " index2: " + indexSwap[1]);
	trace("sendExtensionRequest()|room:" + room.Name + "|extCmd:" + SWAP_GEM + "|index1: " + indexSwap[0] + " index2: " + indexSwap[1]);

	var data = new SFS2X.SFSObject();

	data.putInt("index1", parseInt(indexSwap[0]));
	data.putInt("index2", parseInt(indexSwap[1]));

	SendExtensionRequest(SWAP_GEM, data);

}

function SwapGem(param) {
    let isValidSwap = param.getBool("validSwap");
    if (!isValidSwap) {
        return;
    }
    HandleGems(param);
}


function HandleGems(paramz) {
	let gameSession = paramz.getSFSObject("gameSession");
	currentPlayerId = gameSession.getInt("currentPlayerId");
	//get last snapshot
	let snapshotSfsArray = paramz.getSFSArray("snapshots");
	let lastSnapshot = snapshotSfsArray.getSFSObject(snapshotSfsArray.size() - 1);
	let needRenewBoard = paramz.containsKey("renewBoard");
	// update information of hero
	HandleHeroes(lastSnapshot);
	if (needRenewBoard) {
		grid.updateGems(paramz.getSFSArray("renewBoard"), null);
		// TaskSchedule(delaySwapGem, _ => SendFinishTurn(false));
		setTimeout(function () { SendFinishTurn(false) }, delaySwapGem);
		return;
	}
	// update gem
	grid.gemTypes = botPlayer.getRecommendGemType();

	let gemCode = lastSnapshot.getSFSArray("gems");
	let gemModifiers = lastSnapshot.getSFSArray("gemModifiers");

	console.log("gemModifiers : ", gemModifiers);

	grid.updateGems(gemCode, gemModifiers);

	// setTimeout(function () { SendFinishTurn(false) }, delaySwapGem);
}

function HandleHeroes(paramz) {
	let heroesBotPlayer = paramz.getSFSArray(botPlayer.displayName);
	for (let i = 0; i < botPlayer.heroes.length; i++) {
		botPlayer.heroes[i].updateHero(heroesBotPlayer.getSFSObject(i));
	}

	let heroesEnemyPlayer = paramz.getSFSArray(enemyPlayer.displayName);
	for (let i = 0; i < enemyPlayer.heroes.length; i++) {
		enemyPlayer.heroes[i].updateHero(heroesEnemyPlayer.getSFSObject(i));
	}
}

var log = function (msg) {
	console.log("phi : " + "|" + msg);
}


function SendExtensionRequest(extCmd, paramz) {
    sfs.send(new SFS2X.ExtensionRequest(extCmd, paramz, room));
}

function GetRandomInt(max) {
    return Math.floor(Math.random() * max);
}


function SelectGem() {
    let recommendGemType = botPlayer.getRecommendGemType();
    let gemSelect = Array.from(recommendGemType).find(gemType => Array.from(grid.gemTypes).includes(gemType));
    return gemSelect;
}

function HandleCastSkill(botPlayerHerosFullMana) {
    let seaSpirit = botPlayer.getHeroById('SEA_SPIRIT');
    let airSpirit = botPlayer.getHeroById('AIR_SPIRIT');
    let fireSpirit = botPlayer.getHeroById('FIRE_SPIRIT');
    let enemyHerosAlive = enemyPlayer.getHerosAlive();
    let target = { targetId: null, selectedGem: null, gemIndex: null, isTargetAllyOrNot: null };
    if (seaSpirit && seaSpirit.isFullMana()) {
        if (airSpirit && airSpirit.attack >= AIR_SPIRIT_MAXATTACK && !BotHeroCanBeKilled(seaSpirit)) {
            let recommendSwapGemIndex = HandleSwapGems();
            SendSwapGem(recommendSwapGemIndex);
        } else {
            if (airSpirit)
                target.targetId = airSpirit.id.toString();
            else
                target.targetId = seaSpirit.id.toString();
        }
        SendCastSkill(seaSpirit, target);
        return;
    }
	else if (fireSpirit && fireSpirit.isFullMana()) {
        let gemRed = grid.numberOfGemType(GemType.RED);
        let enemyHeroCanBeKilleds = [];
        let enemyHeroCanBeKilledAndIsFullManas = [];
        let enemyIsFullManas = enemyHerosAlive.filter(x => x.isFullMana());
        for (let i = 0; i < enemyIsFullManas.length; i++) {
            let skillDames = enemyIsFullManas[i].attack + gemRed;
            if (skillDames >= enemyIsFullManas[i].hp) {
                enemyHeroCanBeKilledAndIsFullManas.push(enemyIsFullManas[i]);
            }
        }
        if (enemyHeroCanBeKilledAndIsFullManas.length > 0){
            let enemyHeroId = GetEnemyHeroHasAttackMax(enemyHeroCanBeKilledAndIsFullManas, enemyHeroCanBeKilledAndIsFullManas.length);
            target.targetId = enemyHeroId.toString();
            SendCastSkill(fireSpirit, target);
            return;
        }
		else {
            for (let i = 0; i < enemyHerosAlive.length; i++) {
                let skillDames = enemyHerosAlive[i].attack + gemRed;
                if (skillDames >= enemyHerosAlive[i].hp)
                    enemyHeroCanBeKilleds.push(enemyHerosAlive[i]);
            }
            if (enemyHeroCanBeKilleds.length > 0) {
                let enemyHeroId = GetEnemyHeroHasAttackMax(enemyHeroCanBeKilleds, enemyHeroCanBeKilleds.length);
                target.targetId = enemyHeroId.toString();
                SendCastSkill(fireSpirit, target);
                return;
            }
			else {
                if (enemyHerosAlive && enemyHerosAlive.length > 0) {
                    let enemyHeroId = GetEnemyHeroHasAttackMax(enemyHerosAlive, enemyHerosAlive.length);
                    target.targetId = enemyHeroId.toString();
                    SendCastSkill(fireSpirit, target);
                    return;
                }
            }
        }
    }
    if (airSpirit && airSpirit.isFullMana()) {
        //target.gemIndex = HandleIndexCastSkillAirSpirit();
        let swords = HandleCastSkillAirSpirit([ GemType.SWORD ]);
        if (swords && swords[0].quantity > 2) {
            target.gemIndex = swords[0].index.toString();
            target.isTargetAllyOrNot = true;
            SendCastSkill(airSpirit, target);
            return;
        }
        let gemTypesRecommend = GetListGemsPriority(airSpirit, true);
        if (gemTypesRecommend && gemTypesRecommend.length > 0) {
            let listChoice = HandleCastSkillAirSpirit(gemTypesRecommend)
            if (listChoice) {
                target.gemIndex = listChoice[0].index.toString();
                target.isTargetAllyOrNot = true;
                SendCastSkill(airSpirit, target);
                return;
            }
        }
    }
    SendCastSkill(botPlayerHerosFullMana[0]);
}

function GetEnemyHeroHasAttackMax(enemyHeros, n) {
	let maxDame = enemyHeros[0].attack;
	let enemyHeroId = enemyHeros[0].id;
    for (let i = 1; i < n; i++)
        if (maxDame < enemyHeros[i].attack) {
            maxDame = enemyHeros[i].attack;
            enemyHeroId = enemyHeros[i].id;
        }
    return enemyHeroId;
}

//Handle Swap Gems 

function HandleSwapGems() {
    let listMatchGem = grid.suggestMatch();
    if (listMatchGem.length === 0) {
        return [-1, -1];
    }

    let seaSpirit = botPlayer.getHeroById('SEA_SPIRIT');
    let airSpirit = botPlayer.getHeroById('AIR_SPIRIT');
    let fireSpirit = botPlayer.getHeroById('FIRE_SPIRIT');

    let firstHeroAlive_botPlayer = botPlayer.firstHeroAlive();
    let firstHeroAlive_enemyPlayer = enemyPlayer.firstHeroAlive();

    let listGemModifierPriority = [ 
        GemModifier.EXTRA_TURN,
        GemModifier.EXPLODE_VERTICAL,
        GemModifier.EXPLODE_HORIZONTAL,
        GemModifier.EXPLODE_SQUARE,
        GemModifier.BUFF_ATTACK,
        GemModifier.HIT_POINT,
        GemModifier.MANA 
    ];

    let listGemTypePriority = GetListGemsPriority("AIR_SPIRIT");
    console.log("listGemTypePriority: ", listGemTypePriority);
    
    if(checkListEnemyHeroHasOneshot()) {
        listGemTypePriority.unshift(GemType.RED);
    }

    let matchGemSwordThanFour = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.SWORD ], 5);
    if (matchGemSwordThanFour) {
        return matchGemSwordThanFour;
    }
	listGemModifierPriority.forEach(element => {
        let matchGemSizeThanFourAndHasGemModifier = listMatchGem.find(x => x.sizeMatch > 4 && x.modifier == element);
        if (matchGemSizeThanFourAndHasGemModifier) {
            return matchGemSizeThanFourAndHasGemModifier.getIndexSwapGem();
        }
    })
    let matchGemSizeThanFour = listMatchGem.find(x => x.sizeMatch > 4);
    if (matchGemSizeThanFour) {
        return matchGemSizeThanFour.getIndexSwapGem();
    }

    if (firstHeroAlive_botPlayer.attack >= firstHeroAlive_enemyPlayer.hp) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.SWORD ]);
        if (indexSwapGem)
            return indexSwapGem;
    }

    if (airSpirit && airSpirit.getMaxManaCouldTake() <= 4) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.BLUE, GemType.GREEN ], 4);
        if (indexSwapGem)
            return indexSwapGem;
    }
    if (seaSpirit && seaSpirit.getMaxManaCouldTake() <= 4) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.GREEN, GemType.YELLOW ], 4);
        if (indexSwapGem)
            return indexSwapGem;
    }
    if (fireSpirit && fireSpirit.getMaxManaCouldTake() <= 4) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.RED, GemType.PURPLE ], 4);
        if (indexSwapGem)
            return indexSwapGem;
    }
    if (airSpirit && airSpirit.getMaxManaCouldTake() <= 3) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.BLUE, GemType.GREEN ], 3);
        if (indexSwapGem)
            return indexSwapGem;
    }
    if (seaSpirit && seaSpirit.getMaxManaCouldTake() <= 3) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.GREEN, GemType.YELLOW ], 3);
        if (indexSwapGem)
            return indexSwapGem;
    }
    if (fireSpirit && fireSpirit.getMaxManaCouldTake() <= 3) {
        let indexSwapGem = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.RED, GemType.PURPLE ], 3);
        if (indexSwapGem)
            return indexSwapGem;
    }

    for (let i = 0; i < listGemTypePriority.length; i++) {
        for (let j = 0; j < listGemModifierPriority.length; j++) {
            let matchGemSizeThanThreeHasTypeAndModifyPriority = listMatchGem.find(x => x.sizeMatch > 3 && x.type == listGemTypePriority[i] && x.modifier == listGemModifierPriority[j]);
            if (matchGemSizeThanThreeHasTypeAndModifyPriority) {
                return matchGemSizeThanThreeHasTypeAndModifyPriority.getIndexSwapGem();
            }
        }
    }

    for (let i = 0; i < listGemTypePriority.length; i++) {
        for (let j = 0; j < listGemModifierPriority.length; j++) {
            let matchGemSizeThanTwoHasTypeAndModifyPriority = listMatchGem.find(x => x.sizeMatch > 2 && x.type == listGemTypePriority[i] && x.modifier == listGemModifierPriority[j]);
            if (matchGemSizeThanTwoHasTypeAndModifyPriority) {
                return matchGemSizeThanTwoHasTypeAndModifyPriority.getIndexSwapGem();
            }
        }
    }

    for (let i = 0; i < listGemModifierPriority.length; i++) {
        let matchGemSizeThanThreeHasModifyPriority = listMatchGem.find(x => x.sizeMatch > 3 && x.modifier == listGemModifierPriority[i]);
        if (matchGemSizeThanThreeHasModifyPriority) {
            return matchGemSizeThanThreeHasModifyPriority.getIndexSwapGem();
        }
    }

    for (let i = 0; i < listGemModifierPriority.length; i++) {
        let matchGemSizeThanTwoHasModifyPriority = listMatchGem.find(x => x.sizeMatch > 2 && x.modifier == listGemModifierPriority[i]);
        if (matchGemSizeThanTwoHasModifyPriority) {
            return matchGemSizeThanTwoHasModifyPriority.getIndexSwapGem();
        }
    }

    for (let i = 0; i < listGemTypePriority.length; i++) {
        let matchGemSizeThanThreeHasTypePriority = listMatchGem.find(x => x.sizeMatch > 3 && x.type == listGemTypePriority[i]);
        if (matchGemSizeThanThreeHasTypePriority) {
            return matchGemSizeThanThreeHasTypePriority.getIndexSwapGem();
        }
    }

    for (let i = 0; i < listGemTypePriority.length; i++) {
        console.log("gemType_____:", listMatchGem[0].type);
        let matchGemSizeThanTwoHasTypePriority = listMatchGem.find(x => x.sizeMatch > 2 && x.type == listGemTypePriority[i]);
        if (matchGemSizeThanTwoHasTypePriority) {
            return matchGemSizeThanTwoHasTypePriority.getIndexSwapGem();
        }
    }

    let matchAnyGemSwordThanThree = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.SWORD ], 4);
    if (matchAnyGemSwordThanThree) {
        return matchAnyGemSwordThanThree;
    }

    let matchAnyGemSwordThanTwo = GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.SWORD ], 3);
    if (matchAnyGemSwordThanTwo) {
        return matchAnyGemSwordThanTwo;
    }

    let enemyHerosAlive = enemyPlayer.getHerosAlive();
    enemyHerosAlive.forEach(element => {
        let listMatchGemByType = listMatchGem.filter(gem => element.gemTypes.includes(gem.type));
        if (listMatchGemByType && listMatchGemByType.length > 0) {
			var matchMana = listMatchGemByType.find(gem => gem.sizeMatch >= (element.maxMana - element.mana));
			if (matchMana) {
				return matchMana.getIndexSwapGem();
			}
			return listMatchGemByType[0].getIndexSwapGem();
        }
    });

    let matchAnyGemSizeThanThree = listMatchGem.find(x => x.sizeMatch > 3);
    if (matchAnyGemSizeThanThree) {
        return matchAnyGemSizeThanThree.getIndexSwapGem();
    }

    let matchAnyGemSizeThanTwo = listMatchGem.find(x => x.sizeMatch > 2);
    if (matchAnyGemSizeThanTwo) {
        return matchAnyGemSizeThanTwo.getIndexSwapGem();
    }
    return listMatchGem[0].getIndexSwapGem();

}

function GetListGemsPriority(priorityHero, isCheckFullMana = false) {
    let heroesAlive = botPlayer.getHerosAlive();
    if (isCheckFullMana) {
        heroesAlive = botPlayer.getHerosAliveAndUnFullMana();
    };
    let listGemsPriority = [];
    if (heroesAlive && heroesAlive.length > 0) {
        heroesAlive.forEach(element => {
            let gemTypesReverse = element.gemTypes.reverse();
            if (priorityHero && element.id == priorityHero && listGemsPriority.length > 0)
                gemTypesReverse.forEach(gem => listGemsPriority.unshift(gem));
            else
                gemTypesReverse.forEach(gem => listGemsPriority.push(gem));
        });
    }
    console.log("listGemsPriority100000: ", listGemsPriority);
    return listGemsPriority.filter(function(item, index) {
        if (listGemsPriority.indexOf(item) == index)
            return item;
    });
}

function GetIndexSwapGemByGemTypeAndSizeMatch(gemTypes, sizeMatch = null) {
    let listMatchGem = grid.suggestMatch();
    if (sizeMatch) {
        let matchGemThanSizeMatch = listMatchGem.find(x => gemTypes.includes(x.type) && x.sizeMatch >= sizeMatch);
        if (matchGemThanSizeMatch)
            return matchGemThanSizeMatch.getIndexSwapGem();
    } else {
        let matchGemSwordThanThree = listMatchGem.find(x => gemTypes.includes(x.type) && x.sizeMatch > 3);
        if (matchGemSwordThanThree)
            return matchGemSwordThanThree.getIndexSwapGem();
        let matchGemSwordThanTwo = listMatchGem.find(x => gemTypes.includes(x.type) && x.sizeMatch > 2);
        if (matchGemSwordThanTwo)
            return matchGemSwordThanTwo.getIndexSwapGem();
    }
    return null;
}

function BotHeroCanBeKilled (hero) {
    let enemyHeroFullMana = enemyPlayer.anyHeroFullMana();
    if (enemyHeroFullMana)
        return true;
    let enemyAttackMax = GetEnemyHeroAHasAttackMax(enemyPlayer.getHerosAlive(), enemyPlayer.getTotalHeroAlive());
    if (enemyAttackMax >= hero.hp && GetIndexSwapGemByGemTypeAndSizeMatch([ GemType.SWORD ]))
        return true;
    return false;
}

function checkListEnemyHeroHasOneshot (){
    let listEnemyHeroAlive = enemyPlayer.getHerosAlive();
    for (let i = 0; i < listEnemyHeroAlive.length; i++){
        if (listEnemyHeroAlive[i].gemTypes == GemType.RED) {
            let heroHasGemRed = listEnemyHeroAlive[i];
            if (heroHasGemRed.maxMana - heroHasGemRed.mana <= 3 )
                return true;
        }
    }
    return false;
}

function HandleCastSkillAirSpirit(gemTypes) {
    let boardIndexGem = [0, 1, 2, 8, 9, 10, 16, 17, 18];
    let indexGemsUnCheck = [8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55];
    let indexStep = 5;
    let listGemsPriority = [];

    while (boardIndexGem[4] <= 55) {
            let indexBoard3x3 = boardIndexGem[4];
            if (!indexGemsUnCheck.includes(indexBoard3x3)) {
                listGemsPriority.push(FindNumberGemTypeOfMatrix(boardIndexGem, gemTypes, indexBoard3x3));
            }
            for(let i = 0; i < boardIndexGem.length; i++){
                if(boardIndexGem[0] < indexStep){
                    boardIndexGem[i] += 1;
                }
                else{
                    boardIndexGem[i] += 3;
                    indexStep += 8;
                }
            }
        }
    console.log("listGemsPriority: ", listGemsPriority)
    let quantityMax = Math.max(...listGemsPriority.map(o => o.quantity), 0);
    console.log("Max: ", quantityMax);
    var list = listGemsPriority.filter(x => x.quantity == quantityMax);
    console.log("listGemsPriority.indexOf(...quantityMax): ", list);
    return list;
}

function FindNumberGemTypeOfMatrix(boardIndexGem, listGemType, indexBoard3x3) {
    let gemDetails = [];
    let totalReturn = 0;
    listGemType.forEach(gemType => {
        let quantity = 0;
        let modifier = null;
        boardIndexGem.forEach(index => {
            if (index < 64 && grid.gems[index].type === gemType || grid.gems[index].modifier === GemModifier.EXTRA_TURN) {
                quantity += 1;
                totalReturn += 1;
                modifier = grid.gems[index].modifier;
            }
        })
        gemDetails.push({ quantityOfGem: quantity, gemType: gemType, gemModifier: modifier })
    })
    return { index: indexBoard3x3, quantity: totalReturn, gemDetails };
}