/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Objets de jeu, coté serveur de
	pages/clientScript/gameObjects.js
--------------------------------------------------- */


const util = require('./util');

var mapSize = {'width':0,'height':0};
var bonhommeBounds = {'minX':0,'maxX':0,'minY':0,'maxY':0};
var balleBounds = {'minX':0,'maxX':0,'minY':0,'maxY':0};
var bonhommeSize = 10;

module.exports.setBounds = function(size){
	mapSize.width = size.width;
	mapSize.height = size.height;
	bonhommeBounds.minX = bonhommeSize/2;
	bonhommeBounds.minY = bonhommeSize/2;
	bonhommeBounds.maxX = size.width - bonhommeSize/2;
	bonhommeBounds.maxY = size.height - bonhommeSize/2;
	balleBounds.minX = 0;
	balleBounds.minY = 0;
	balleBounds.maxX = size.width;
	balleBounds.maxY = size.height;
};

var Bonhomme = function(){
	this.type = 'Bonhomme';

	this.nom = null;
	this.vitMax = 0.2;
	this.size = bonhommeSize;
	this.score = 0;

	// Spécial serveur
	// TODO clientPos : position synchro avec celle envoyé aux clients
	this.clientPos = new util.animOrientedPoint();
	this.key = null;
	this.toDelete = false;
	
	// point
	var P = new util.animOrientedPoint();
	this.P = P;

	P.orientVectorSize = 20;
	this.setSize = function(size){
		this.size = size;
		P.animPoint.size = size;
	};
	this.setSize(bonhommeSize);

	// mouse tracking
	this.mouseX = 0;
	this.mouseY = 0;
	this.lookTo = function(x,y){
		this.mouseX = x;
		this.mouseY = y;
	};

	this.colide = function(){
		// X
		if(P.getPos().x < bonhommeBounds.minX)
			P.getPos().x = bonhommeBounds.minX;
		else if(P.getPos().x > bonhommeBounds.maxX)
			P.getPos().x = bonhommeBounds.maxX;
		// Y
		if(P.getPos().y < bonhommeBounds.minY)
			P.getPos().y = bonhommeBounds.minY;
		else if(P.getPos().y > bonhommeBounds.maxY)
			P.getPos().y = bonhommeBounds.maxY;
	};

	this.stepAnim = function(t){
		P.stepAnim(t);
		this.clientPos.stepAnim(t);

		this.colide();
	};

	this.drawOn = function(ctx){
		P.drawOn(ctx);

		ctx.font = '12px Arial';
		if(P.getPos().y<this.size/2+16)
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y+this.size/2+15);
		else
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y-this.size/2-4);
	};

	// Packing
	this.toMaj = {	'nom':false,
					'size':false,
					'vitMax':false,
					'score':false};

	this.pack = function(){
		return {'type':'Bonhomme','data':this.P.pack(),'nom':this.nom,'size':this.size,'vitMax':this.vitMax,'score':this.score};
	};

	this.packMaj = function(){
		var package = {};
		if(this.toMaj.nom)
			package.nom = this.nom;
		if(this.toMaj.size)
			package.size = this.size;
		if(this.toMaj.vitMax)
			package.vitMax = this.vitMax;
		if(this.toMaj.score)
			package.score = this.score;
		this.toMaj = {	'nom':false,
						'size':false,
						'vitMax':false,
						'score':false};
		return package;
	};

	this.packP = function(){
		return {'data':this.P.pack()};
	};

	this.unpack = function(obj){
		if(obj.type !== undefined && obj.type !== "Bonhomme")
			return new Error("wrong unpack type : "+obj.type);
		if(obj.data !== undefined)
			this.P.unpack(obj.data);
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.size !== undefined)
			this.setSize(obj.size);
		if(obj.vitMax !== undefined)
			this.vitMax = obj.vitMax;
		if(obj.score !== undefined)
			this.score = obj.score;
	};

	this.smoothUnpack = function(obj,T){
		if(obj.type !== undefined && obj.type !== "Bonhomme")
			return new Error("wrong unpack type : "+obj.type);
		if(obj.data !== undefined)
			this.P.smoothUnpack(obj.data,T);
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.size !== undefined)
			this.setSize(obj.size);
		if(obj.vitMax !== undefined)
			this.vitMax = obj.vitMax;
		if(obj.score !== undefined){
			this.score = obj.score;
			updatePlayerList();
		}
	};

	this.updateClientPos = function(T){
		var obj = this.packP();
		this.clientPos.smoothUnpack(obj.data,T);
	};

	// Actions
	this.fire = function(){
		var balle = new Balle();
		balle.P.getPos().x = this.clientPos.getPos().x + this.clientPos.orientVector.pos.x;
		balle.P.getPos().y = this.clientPos.getPos().y + this.clientPos.orientVector.pos.y;
		balle.P.getVit().setFromVect(this.clientPos.orientVector.pos);
		balle.P.getVit().setRayonTo(balle.vitMax);
		balle.dad = this;
		return balle;
	};

	this.isHitBy = function(object){
		var minX = this.clientPos.getPos().x - this.size/2;
		var minY = this.clientPos.getPos().y - this.size/2;
		var maxX = this.clientPos.getPos().x + this.size/2;
		var maxY = this.clientPos.getPos().y + this.size/2;
		var pos = object.P.getPos();
		return pos.x > minX && pos.x < maxX && pos.y > minY && pos.y < maxY;
	};
};

/*
	tic = 10ms
	largeur d'un péon : 10px
	vitMax < 10px / 10ms = 1
*/
var Balle = function(){
	this.type = 'Balle';
	this.vitMax = 0.5;
	this.size = 6;

	this.toDelete = false;
	this.dad = null;

	// point
	var P = new util.animPoint();
	this.P = P;
/*	/// affichage de la trace
	this.trainee = new util.Vector2D();*/

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
		// X
		if(P.getPos().x < balleBounds.minX){
			this.toDelete = true;
			return;
		}
		else if(P.getPos().x > balleBounds.maxX){
			this.toDelete = true;
			return;
		}
		// Y
		else if(P.getPos().y < balleBounds.minY){
			this.toDelete = true;
			return;
		}
		else if(P.getPos().y > balleBounds.maxY){
			this.toDelete = true;
			return;
		}
	};

	this.stepAnim = function(t){ // t en ms
/*		this.trainee.x = -P.getVit().x;
		this.trainee.y = -P.getVit().y;
		this.trainee.setRayonTo(this.size);*/

		P.stepAnim(t);

		this.colide();
	};

	// Packing
	this.toMaj = {	'size':false,
					'vitMax':false};

	this.pack = function(){
		return {'type':'Balle','data':this.P.pack()};
	};

	this.packMaj = function(){
		var package = {};
		if(this.toMaj.size)
			package.size = this.size;
		if(this.toMaj.vitMax)
			package.vitMax = this.vitMax;
		this.toMaj = {	'size':false,
						'vitMax':false};
		return package;
	};

	this.packP = function(){
		return {'data':this.P.pack()};
	};

	this.unpack = function(obj){
		if(obj.type !== undefined && obj.type !== "Balle")
			return new Error("wrong unpack type : "+obj.type);
		if(obj.data !== undefined)
			this.P.unpack(obj.data);
		if(obj.size !== undefined)
			this.size = obj.size;
		if(obj.vitMax !== undefined)
			this.vitMax = obj.vitMax;
	};

	this.smoothUnpack = function(obj,T){
		if(obj.type !== undefined && obj.type !== "Balle")
			return new Error("wrong unpack type : "+obj.type);
		if(obj.data !== undefined)
			this.P.smoothUnpack(obj.data,T);
		if(obj.size !== undefined)
			this.size = obj.size;
		if(obj.vitMax !== undefined)
			this.vitMax = obj.vitMax;
	};
};


module.exports.Bonhomme = Bonhomme;
module.exports.Balle = Balle;
