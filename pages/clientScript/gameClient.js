// ---- GameObjects ---- //

var gameObjectPool = [];
var yourBonhomme = null;
var yourBonhommeKey = null;

// ---- Settings ---- //

var mapSize = null;
var dTUpdateCycle = null;

var setSettings = function(settings){
	mapSize = settings.mapSize;
	dTUpdateCycle = settings.dTUpdateCycle;
}

// ---- Display ---- //

var gameCanvas = new canvasObj('gameCanvas');
var lastDraw = null;

addLoadEvent(function(){
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
	- reqUpdatePos : null, cb(data)
		Demande une mise a jour de la position
	- updateObjects : [{'key':key, 'data':data},...]
		Informe de la mise a jour de plusieurs objets
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : bonhomme, cb(key/'erreur')
		Informe le serveur de son entré en jeu
	- fire
		// TODO
	- disconnect
		Deconnexion du client
*/

var initGameSocket = function(){
	var infoElement = document.getElementById('gameInfo');
	gameSocket = io('/game');

	gameSocket.on('connect',function(){
		infoElement.innerHTML = 'Connecté au serveur';
		
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
			if(obj !== undefined){
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
	});

	var updateObject = function(obj) {
		var key = obj.key;
		gameObjectPool[key].unpackP(obj.data);
		if(gameObjectPool[key].type === 'Bonhomme'){
			gameObjectPool[key].P.setBreak(dTUpdateCycle);
		}
	};

	gameSocket.on('reqUpdatePos', function(objs,cb) {
		cb(movDir.pack());
		for(var i=0;i<objs.length;i++){
			updateObject(objs[i]);
		}
	});

	gameSocket.on('updateObjects', function(objs){
		for(var i=0;i<objs.length;i++)
			updateObject(objs[i]);
	});

	gameSocket.on('deleteObject', function(key){
		delete gameObjectPool[key];
	});

	gameSocket.on('departDuJoueur', function(key){
		delete gameObjectPool[key];
	});

	gameSocket.on('disconnect',function(){
		infoElement.innerHTML = 'Perte de la connexion au serveur';
		var gameObjectPool = [];
		var lastDraw = null;

		var yourBonhomme = null;
		var yourBonhommeKey = null;
	});
};

var setYourBonhomme = function(str){
	var pseudo = prompt(str);
	if(pseudo === undefined)
		return;

	var jaque = new Bonhomme();
	jaque.nom = pseudo;
	jaque.P.setPos(100,100);

	gameSocket.emit('nouveauJoueur', jaque.pack(), function(rep){
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

var movDir = new Vector2D(0,0);

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
};

var mouseEvent = function(event){
	if(yourBonhomme === null)
		return;
	var rect = gameCanvas.element.getBoundingClientRect();
	var mouseX = event.clientX - rect.left;
	var mouseY = event.clientY - rect.top;
	yourBonhomme.lookTo(mouseX,mouseY);
};

var clickEvent = function(event){
/*	if(yourBonhomme === null)
		return;
	yourBonhomme.fire();*/
};

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
