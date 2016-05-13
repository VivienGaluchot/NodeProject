// ---- GameObjects ---- //

var gameObjectPool = [];
var yourBonhomme = null;
var yourBonhommeKey = null;

// ---- Settings ---- //

var mapSize = null;
var dTUpdateCycle = null;

var setSettings = function(settings){
	mapSize = settings.mapSize;
	gameCanvas.setSize(mapSize);
	dTUpdateCycle = settings.dTUpdateCycle;
};

// ---- Display ---- //

// Informationss
var infoConnectedState = null;
var infoPlayerList = null;

var updatePlayerList = function(){
	var temp;
	var n = 0;
	var list = "";
	for(var i=0;i<gameObjectPool.length;i++){
		temp = gameObjectPool[i];
		if(temp !== undefined && temp.type === 'Bonhomme'){
			n++;
			list += "<tr><td>"+temp.nom+"</td><td><b>"+temp.score+"</b></td></tr>";
		}
	}
	infoPlayerList.innerHTML = "<br><b>" + n + "joueur";
	if(n>1)	infoPlayerList.innerHTML += "s";
	infoPlayerList.innerHTML += " :</b><table>"+list+"</table>";
};

// Canvas
var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;

addLoadEvent(function(){
	infoConnectedState = document.getElementById('infoConnectedState');
	infoPlayerList = document.getElementById('infoPlayerList');

	gameCanvas.load();

	initGameSocket();

	window.addEventListener('click',clickEvent,false);
	window.addEventListener('keydown',toucheDown,false);
	window.addEventListener('keyup',toucheUp,false);
	window.addEventListener('keypress',touchePress,false);
	window.addEventListener('mousemove',mouseEvent,false);
});

addResizeEvent(function(){
	gameCanvas.resize();
});

gameCanvas.draw = function(){
	var nT = Date.now();
	var dT = nT - lastDraw;
	lastDraw = nT;

	gameCanvas.ctx.clearRect(0,0,gameCanvas.width,gameCanvas.height);

	for(var i=0;i<gameObjectPool.length;i++){
		if(gameObjectPool[i] !== undefined){	
			gameObjectPool[i].stepAnim(dT);
			gameObjectPool[i].drawOn(gameCanvas.ctx);
		}
	}

	window.requestAnimationFrame(gameCanvas.draw);
};

// ---- Socket ---- //

var gameSocket = null;

/*
  Evenements :

	Serveur -> Client
	- initGame : {'settings':data, 'pool':data}
		Envoi l'etat du jeu au client
	- newObject : {'key':key, 'data':data}
		Objet a ajouter a la pool 
	- reqUpdatePos : objectsUpdated, cb({'mov':movDir,'look':lookDir})
		Demande une mise a jour de la position
	- updateObjects : [{'key':key, 'data':data},...,{'key':key, 'toDelete':true},{'key':key, 'hit':true},...]
		Informe de la mise a jour de plusieurs objets
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : pseudo, cb(key/'erreur')
		Informe le serveur de son entré en jeu
	- fire
		// TODO
	- disconnect
		Deconnexion du client
*/


var initGameSocket = function(){
	gameSocket = io('/game');

	gameSocket.on('connect',function(){
		infoConnectedState.innerHTML = 'Connecté au serveur';
		
		setYourBonhomme('Entrez votre pseudo');
	});

	//{'settings':data, 'pool':data}
	gameSocket.on('initGame', function(data,cb) {
		var settings = data.settings;
		var pool = data.pool;

		setSettings(settings);

		gameObjectPool = [];

		for(var i=0;i<pool.length;i++){
			var obj = pool[i];
			if(obj !== undefined && obj !== null){
				if(obj.type === 'Bonhomme'){
					var bonhomme = new Bonhomme();
					bonhomme.unpack(obj);
					gameObjectPool[i] = bonhomme;
				} else if(obj.type === 'Balle'){
					var balle = new Balle();
					balle.unpack(obj);
					gameObjectPool[i] = balle;
				} /*else {
					// TODO gestion d'erreur ?
				}*/
			}
		}

		yourBonhomme = gameObjectPool[yourBonhommeKey];

		// Debut du dessin
		lastDraw = Date.now();
		gameCanvas.startDraw();

		// Update info
		updatePlayerList();
	});

	gameSocket.on('newObject', function(objet) {
		var data = objet.data;

		if(data.type === 'Bonhomme'){
			var bonhomme = new Bonhomme();
			bonhomme.unpack(data);
			gameObjectPool[objet.key] = bonhomme;
		} else if(data.type === 'Balle'){
			var balle = new Balle();
			balle.unpack(data);
			gameObjectPool[objet.key] = balle;
		} /*else {
			// TODO gestion d'erreur ?
		}*/

		// Update info
		updatePlayerList();
	});

	var updateObject = function(obj) {
		if(gameObjectPool[obj.key] !== undefined)
			gameObjectPool[obj.key].smoothUnpack(obj.data,dTUpdateCycle);
	};

	gameSocket.on('reqUpdatePos', function(objs,cb) {
		cb({'mov':movDir.pack(),'look':yourBonhomme.P.orientVector.pack()});
		for(var i=0;i<objs.length;i++){
			updateObject(objs[i]);
		}
	});

	// updateObjects : [{'key':key, 'data':data},...,{'key':key, 'toDelete':true},{'key':key, 'hit':true},...]
	gameSocket.on('updateObjects', function(objs){
		for(var i=0;i<objs.length;i++){
			if(objs[i].data !== undefined)
				updateObject(objs[i]);
			if(objs[i].hit === true)
				gameObjectPool[objs[i].key].hit();
			if(objs[i].toDelete === true)
				delete gameObjectPool[objs[i].key];
		}
	});

	gameSocket.on('deleteObject', function(key){
		delete gameObjectPool[key];
	});

	gameSocket.on('departDuJoueur', function(key){
		delete gameObjectPool[key];
		// Update info
		updatePlayerList();
	});

	gameSocket.on('disconnect',function(){
		infoConnectedState.innerHTML = 'Perte de la connexion au serveur';
		var gameObjectPool = [];
		var lastDraw = null;

		var yourBonhomme = null;
		var yourBonhommeKey = null;

		// Update info
		updatePlayerList();
	});
};

var pseudo = null;
var setYourBonhomme = function(str){
	if(pseudo === null)
		pseudo = prompt(str);
	
	if(pseudo === undefined)
		return;

	gameSocket.emit('nouveauJoueur', pseudo, function(rep){
		if(rep === 'erreur'){
			alert('Erreur');
		}
		else{
			yourBonhommeKey = rep;
			yourBonhomme = gameObjectPool[yourBonhommeKey];
		}
	});
};


// ---- Inputs ---- //

var UP_ARROW = 38, Z_KEY = 90;
var RIGHT_ARROW = 39, D_KEY = 68;
var DOWN_ARROW = 40, S_KEY = 83;
var LEFT_ARROW = 37, Q_KEY = 81;
var ENTER = 13;

var keyUpDown = false;
var keyRightDown = false;
var keyDownDown = false;
var keyLeftDown = false;

var mouseX;
var mouseY;
var movDir = new Vector2D(0,0);
var lookDir = new Vector2D(0,0);

var toucheDown = function(event){
	if(yourBonhomme === null)
		return;
	if(event.keyCode === UP_ARROW || event.keyCode === Z_KEY) {
		event.preventDefault();
		keyUpDown = true;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW || event.keyCode === D_KEY) {
		event.preventDefault();
		keyRightDown = true;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW || event.keyCode === S_KEY) {
		event.preventDefault();
		keyDownDown = true;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW || event.keyCode === Q_KEY) {
		event.preventDefault();		
		keyLeftDown = true;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
};

var toucheUp = function(event){
	if(yourBonhomme === null)
		return;
	if(event.keyCode === UP_ARROW || event.keyCode === Z_KEY) {
		event.preventDefault();
		keyUpDown = false;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW || event.keyCode === D_KEY) {
		event.preventDefault();
		keyRightDown = false;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW || event.keyCode === S_KEY) {
		event.preventDefault();
		keyDownDown = false;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW || event.keyCode === Q_KEY) {
		event.preventDefault();		
		keyLeftDown = false;
		bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
};

var touchePress = function(event){
	gameSocket.emit('fire');
};

var mouseEvent = function(event){
	if(yourBonhomme === null)
		return;
	var rect = gameCanvas.element.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;
	yourBonhomme.lookTo(mouseX,mouseY);
	lookDir.setFromVect(yourBonhomme.P.orientVector);
};

var clickEvent = function(event){
	gameSocket.emit('fire');
};

// TODO : smooth binding

var bindKey = function(up,right,down,left){
	movDir.set(0,0);
	if(up !== down){
		if(up){ // vers le haut
			movDir.y = -1;
		} else { // vert le bas
			movDir.y = 1;
		}
	}

	if(right !== left){
		if(right){ // vers la droite
			movDir.x = 1;
		} else { // vert la gauche
			movDir.x = -1;
		}
	}
};
