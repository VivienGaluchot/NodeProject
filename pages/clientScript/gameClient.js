var gameSocket = null;

var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;

var gameObjectPool = [];

var yourBonhome = null;
var yourBonhomeKey = null;

addLoadEvent(function(){
	initGameSocket();

	gameCanvas.load();
	lastDraw = Date.now();

/*	var franck = new Bonhome();
	franck.nom = 'franck';
	franck.P.pos.x = 200;
	franck.P.pos.y = 100;
	objectPool.push(franck);*/

	window.addEventListener('click',clickEvent,false);
	window.addEventListener('keydown',toucheDown,false);
	window.addEventListener('keyup',toucheUp,false);
	window.addEventListener('keypress',touchePress,false);
	window.addEventListener('mousemove',mouseEvent,false);

	gameCanvas.draw();
});

addResizeEvent(function(){
	gameCanvas.resize();
});

var initGameSocket = function(){
	var infoElement = document.getElementById('gameInfo');
	gameSocket = io('/game');

	gameSocket.on('connect',function(){		
		infoElement.innerHTML = 'Connecté au serveur';
		if(yourBonhome === null)
			setYourBonhome('Entrez votre pseudo');
		else
			gameSocket.emit('nouveauJoueur', yourBonhome.export(), function(rep){
				if(rep === 'pseudoPris')
					setYourBonhome('Pseudo est déja pris');
				else if(rep === 'pseudoVide')
					setYourBonhome('Entrez un pseudo non vide');
				else if(rep === 'plusDePlace')
					alert('Plus de place dans le serveur');
				else
					yourBonhomeKey = rep;
			});
	});

	gameSocket.on('newObject', function(data) {
		var obj = data.obj;

		if(obj.type === 'Bonhome'){
			var bonhome = new Bonhome();
			bonhome.import(obj);
			gameObjectPool[data.key] = bonhome;
		} else if(obj.type === 'Balle'){
			var balle = new Balle();
			balle.import(obj);
			gameObjectPool[data.key] = balle;
		} else {
			// TODO gestion d'erreur ?
		}
	});

	gameSocket.on('reqUpdatePos', function(obj) {
		gameSocket.emit('updatePos',yourBonhome.exportP());
	});

	gameSocket.on('updateObjectPool', function(obj) {
		gameObjectPool[obj.key].importP(obj.data);
	});

	gameSocket.on('initObjectPool', function(data) { // data : gameObjectPool
		gameObjectPool = [];

		for(var i=0;i<data.length;i++){
			var obj = data[i];

			if(obj !== undefined){
				if(obj.type === 'Bonhome'){
					var bonhome = new Bonhome();
					bonhome.import(obj);
					gameObjectPool[i] = bonhome;
				} else if(obj.type === 'Balle'){
					var balle = new Balle();
					balle.import(obj);
					gameObjectPool[i] = balle;
				} else {
					// TODO gestion d'erreur ?
				}
			}
		}

		yourBonhome = gameObjectPool[yourBonhomeKey];
	});

	gameSocket.on('deleteObject', function(key){
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
	jaque.P.pos.x = 100;
	jaque.P.pos.y = 100;

	gameSocket.emit('nouveauJoueur', jaque.export(), function(rep){
		if(rep === 'pseudoPris')
			setYourBonhome('Ce pseudo est déja pris');
		else if(rep === 'pseudoVide')
			setYourBonhome('Entrez un pseudo non vide');
		else
			yourBonhomeKey = rep;
	});
};

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
		this.P.vit.x = 0;
		this.P.vit.y = 0;
		if(up !== down){
			if(up){ // vers le haut
				P.vit.y = -1;
			} else { // vert le bas
				P.vit.y = 1;
			}
		}

		if(right !== left){
			if(right){ // vers la droite
				P.vit.x = 1;
			} else { // vert la gauche
				P.vit.x = -1;
			}
		}
		this.P.vit.setRayonTo(this.vitMax);
	};

	this.fire = function(){
		var balle = new Balle();
		// position
		balle.P.pos.x = P.pos.x + this.P.orientVector.x;
		balle.P.pos.y = P.pos.y + this.P.orientVector.y;
		// vitesse
		balle.P.vit.setFromVect(this.P.orientVector);
		balle.P.vit.setRayonTo(balle.vitMax);

		gameSocket.emit('newObject',balle.export(),function(key){
			gameObjectPool[key] = balle;
		});
	};

	this.stepAnim = function(t){
		P.stepAnim(t);
		if(this === yourBonhome)
			P.orientToThePoint(this.mouseX,this.mouseY);

		var temp = this.size/2;
		if(P.pos.x <= temp) P.pos.x = temp;
		if(P.pos.y <= temp) P.pos.y = temp;
		var temp2 = gameCanvas.width - temp;
		if(P.pos.x > temp2) P.pos.x = temp2;
		var temp3 = gameCanvas.height - temp;
		if(P.pos.y > temp3) P.pos.y = temp3;
	};

	this.drawOn = function(ctx){
		P.drawOn(ctx);

		ctx.font = '12px Arial';
		if(P.pos.y<this.size/2+16)
			ctx.fillText(this.nom,P.pos.x - (ctx.measureText(this.nom).width/2),P.pos.y+this.size/2+15);
		else
			ctx.fillText(this.nom,P.pos.x - (ctx.measureText(this.nom).width/2),P.pos.y-this.size/2-4);
	};

	this.export = function(){
		return {'type':'Bonhome','nom':this.nom,'data':this.P.export()};
	};

	this.import = function(obj){
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.data !== undefined)
			this.P.import(obj.data);
	};

	this.exportP = function(){		
		return this.P.export();
	};

	this.importP = function(obj){
		this.P.import(obj);
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
		ctx.moveTo(P.pos.x,P.pos.y);
		ctx.lineTo(P.pos.x+this.trainee.x,P.pos.y+this.trainee.y);
		ctx.stroke();
	};

	this.colide = function(){
		var temp = this.size/2;
		if(P.pos.x <= temp || P.pos.y <= temp)
			this.toDelete = true;
		var temp2 = gameCanvas.width - temp;
		if(P.pos.x > temp2)
			this.toDelete = true;
		var temp3 = gameCanvas.height - temp;
		if(P.pos.y > temp3)
			this.toDelete = true;
	}

	this.stepAnim = function(t){ // t en ms
		this.trainee.x = -P.vit.x;
		this.trainee.y = -P.vit.y;
		this.trainee.setRayonTo(this.size);

		P.stepAnim(t);
	};

	this.export = function(){
		return {'type':'Balle','data':this.P.export()};
	};

	this.import = function(obj){
		this.P.import(obj.data);
	};

	this.exportP = function(){		
		return this.P.export();
	};

	this.importP = function(obj){
		this.P.import(obj);
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