var gameSocket = null;

var gameCanvas = new canvasObj('gameCanvas');

var gameObjectPool = [];
var lastDraw = null;

var yourBonhome = null;
var yourBonhomeKey = null;

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
/*
  Evenements :

	Serveur -> Client
	- initObjectPool : data
		Envoi l'ensemble des objets au client
	- newObject : {'key':key, 'data':data}
		Objet a ajouter a la pool 
	- reqUpdatePos : null, cb(data)
		Demande une mise a jour de la position
	- updateObject : {'key':key, 'data':data}
		Informe de la mise a jour d'un objet 
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : bonhome, cb(key/'pseudoVide'/'erreur')
		Informe le serveur de son entré en jeu
	- newObject
		// TEMPORAIRE
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
		if(yourBonhome === null)
			setYourBonhome('Entrez votre pseudo');

		gameSocket.emit('nouveauJoueur', yourBonhome.pack(), function(rep){
			console.log('cb nouveauJoueur',rep);
			if(rep === 'pseudoVide')
				setYourBonhome('Entrez un pseudo non vide');
			else if(rep === 'erreur')
				alert('Erreur');
			else
				yourBonhomeKey = rep;

			yourBonhome = gameObjectPool[yourBonhomeKey];
			console.log('reception de yourBonhomeKey',yourBonhomeKey);
		});
	});

	gameSocket.on('initObjectPool', function(data,cb) {
		gameObjectPool = [];

		for(var i=0;i<data.length;i++){
			var obj = data[i];

			if(obj !== undefined){
				if(obj.type === 'Bonhome'){
					var bonhome = new Bonhome();
					bonhome.unpack(obj);
					gameObjectPool[i] = bonhome;
				} else if(obj.type === 'Balle'){
					var balle = new Balle();
					balle.unpack(obj);
					gameObjectPool[i] = balle;
				} /*else {
					// TODO gestion d'erreur ?
				}*/
			}
		}
		console.log('yourBonhomeKey : '+gameObjectPool[yourBonhomeKey]);
		yourBonhome = gameObjectPool[yourBonhomeKey];

		// Debut du dessin
		lastDraw = Date.now();
		gameCanvas.startDraw();
	});

	gameSocket.on('newObject', function(objet) {
		var data = objet.data;

		if(data.type === 'Bonhome'){
			var bonhome = new Bonhome();
			bonhome.unpack(data);
			gameObjectPool[objet.key] = bonhome;
		} else if(data.type === 'Balle'){
			var balle = new Balle();
			balle.unpack(data);
			gameObjectPool[objet.key] = balle;
		} /*else {
			// TODO gestion d'erreur ?
		}*/
	});

	gameSocket.on('reqUpdatePos', function(msg,cb) {
		cb(yourBonhome.packP());
	});

	gameSocket.on('updateObject', function(objet) {
		gameObjectPool[obj.key].unpackP(obj.data);
	});

	gameSocket.on('deleteObject', function(key){
		delete gameObjectPool[key];
	});

	gameSocket.on('departDuJoueur', function(key){
		delete gameObjectPool[key];
	});

	gameSocket.on('disconnect',function(){
		infoElement.innerHTML = 'Perte de la connexion au serveur';
	});
};

var setYourBonhome = function(str){
	var pseudo = prompt(str);
	if(pseudo == undefined)
		return;

	var jaque = new Bonhome();
	jaque.nom = pseudo;
	jaque.P.setPos(100,100);

	gameSocket.emit('nouveauJoueur', jaque.pack(), function(rep){
		if(rep === 'pseudoPris')
			setYourBonhome('Ce pseudo est déja pris');
		else if(rep === 'pseudoVide')
			setYourBonhome('Entrez un pseudo non vide');
		else
			yourBonhomeKey = rep;
	});
};

// ---- Bonhome ---- //

var Bonhome = function(){
	this.nom = null;
	this.vitMax = 0.2;
	this.size = 15;
	
	// point
	var P = new animOrientedPoint();
	this.P = P;

	// en rad
	P.orientVectorSize = 20;

	// mouse tracking
	this.mouseX = 0;
	this.mouseY = 0;
	this.lookTo = function(x,y){
		this.mouseX = x;
		this.mouseY = y;
	};

	this.bindKey = function(up,right,down,left){
		this.P.setVit(0,0);
		if(up !== down){
			if(up){ // vers le haut
				this.P.getVit().y = -1;
			} else { // vert le bas
				this.P.getVit().y = 1;
			}
		}

		if(right !== left){
			if(right){ // vers la droite
				this.P.getVit().x = 1;
			} else { // vert la gauche
				this.P.getVit().x = -1;
			}
		}
		this.P.getVit().setRayonTo(this.vitMax);
	};

	this.fire = function(){
		var balle = new Balle();
		// position
		balle.P.getPos().x = P.getPos().x + this.P.orientVector.x;
		balle.P.getPos().y = P.getPos().y + this.P.orientVector.y;
		// vitesse
		balle.P.getVit().setFromVect(this.P.orientVector);
		balle.P.getVit().setRayonTo(balle.vitMax);

		gameSocket.emit('newObject',balle.pack(),function(key){
			gameObjectPool[key] = balle;
		});
	};

	this.stepAnim = function(t){
		P.stepAnim(t);
		if(this === yourBonhome)
			P.orientToThePoint(this.mouseX,this.mouseY);

		var temp = this.size/2;
		if(P.getPos().x <= temp) P.getPos().x = temp;
		if(P.getPos().y <= temp) P.getPos().y = temp;
		var temp2 = gameCanvas.width - temp;
		if(P.getPos().x > temp2) P.getPos().x = temp2;
		var temp3 = gameCanvas.height - temp;
		if(P.getPos().y > temp3) P.getPos().y = temp3;
	};

	this.drawOn = function(ctx){
		P.drawOn(ctx);

		ctx.font = '12px Arial';
		if(P.getPos().y<this.size/2+16)
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y+this.size/2+15);
		else
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y-this.size/2-4);
	};

	this.pack = function(){
		return {'type':'Bonhome','nom':this.nom,'data':this.P.pack()};
	};

	this.unpack = function(obj){
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.data !== undefined)
			this.P.unpack(obj.data);
	};

	this.packP = function(){		
		return this.P.pack();
	};

	this.unpackP = function(obj){
		this.P.unpack(obj);
	};
};

var Balle = function(){
	this.vitMax = 1;
	this.size = 6;

	// point
	var P = new animPoint();
	this.P = P;
	/// affichage de la trace
	this.trainee = new Vector2D();

	this.drawOn = function(ctx){		
		ctx.lineWidth = 3;
		ctx.strokeStyle='rgb(255,50,0)';
		// ligne
		ctx.beginPath();
		ctx.moveTo(P.getPos().x,P.getPos().y);
		ctx.lineTo(P.getPos().x+this.trainee.x,P.getPos().y+this.trainee.y);
		ctx.stroke();
	};

	this.colide = function(){
		var temp = this.size/2;
		if(P.getPos().x <= temp || P.getPos().y <= temp)
			this.toDelete = true;
		var temp2 = gameCanvas.width - temp;
		if(P.getPos().x > temp2)
			this.toDelete = true;
		var temp3 = gameCanvas.height - temp;
		if(P.getPos().y > temp3)
			this.toDelete = true;
	};

	this.stepAnim = function(t){ // t en ms
		this.trainee.x = -P.getVit().x;
		this.trainee.y = -P.getVit().y;
		this.trainee.setRayonTo(this.size);

		P.stepAnim(t);
	};

	this.pack = function(){
		return {'type':'Balle','data':this.P.pack()};
	};

	this.unpack = function(obj){
		this.P.unpack(obj.data);
	};

	this.packP = function(){		
		return this.P.pack();
	};

	this.unpackP = function(obj){
		this.P.unpack(obj);
	};
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

var toucheDown = function(event){
	if(yourBonhome === null)
		return;
	if(event.keyCode === UP_ARROW || event.keyCode === Z_KEY) {
		event.preventDefault();
		keyUpDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW || event.keyCode === D_KEY) {
		event.preventDefault();
		keyRightDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW || event.keyCode === S_KEY) {
		event.preventDefault();
		keyDownDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW || event.keyCode === Q_KEY) {
		event.preventDefault();		
		keyLeftDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
};

var toucheUp = function(event){
	if(yourBonhome === null)
		return;
	if(event.keyCode === UP_ARROW || event.keyCode === Z_KEY) {
		event.preventDefault();
		keyUpDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW || event.keyCode === D_KEY) {
		event.preventDefault();
		keyRightDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW || event.keyCode === S_KEY) {
		event.preventDefault();
		keyDownDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW || event.keyCode === Q_KEY) {
		event.preventDefault();		
		keyLeftDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
};

var touchePress = function(event){

};

var mouseEvent = function(event){
	if(yourBonhome === null)
		return;
	var rect = gameCanvas.element.getBoundingClientRect();
	var mouseX = event.clientX - rect.left;
	var mouseY = event.clientY - rect.top;
	yourBonhome.lookTo(mouseX,mouseY);
};

var clickEvent = function(event){
	if(yourBonhome === null)
		return;
	yourBonhome.fire();
};