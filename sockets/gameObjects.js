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
	this.nom = null;
	this.vitMax = 0.2;
	this.size = bonhommeSize;
	this.type = 'Bonhomme';
	this.score = 0;
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

	this.pack = function(){
		return {'type':'Bonhomme','nom':this.nom,'data':this.P.pack(),'size':this.size,'score':this.score};
	};

	this.unpack = function(obj){
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.data !== undefined)
			this.P.unpack(obj.data);
		if(obj.size !== undefined)
			this.setSize(obj.size);
		if(obj.score !== undefined)
			this.score = obj.score;
	};

	this.packP = function(){
		return this.P.pack();
	};

	this.unpackP = function(obj){
		this.P.unpack(obj);
	};

	this.fire = function(){
		var balle = new Balle();
		balle.P.getPos().x = P.getPos().x + P.orientVector.x;
		balle.P.getPos().y = P.getPos().y + P.orientVector.y;
		balle.P.getVit().setFromVect(P.orientVector);
		balle.P.getVit().setRayonTo(balle.vitMax);
		return balle;
	};
};

var Balle = function(){
	this.vitMax = 0.5;
	this.size = 6;
	this.type = 'Balle';
	this.toDelete = false;

	// point
	var P = new util.animPoint();
	this.P = P;
	/// affichage de la trace
	this.trainee = new util.Vector2D();

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
		this.trainee.x = -P.getVit().x;
		this.trainee.y = -P.getVit().y;
		this.trainee.setRayonTo(this.size);

		P.stepAnim(t);

		this.colide();
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


module.exports.Bonhomme = Bonhomme;
module.exports.Balle = Balle;
