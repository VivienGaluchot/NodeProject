/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Utilitaire, coté serveur de
	pages/clientScript/util.js
--------------------------------------------------- */


// ---- Math ---- //

var Vector2D = function(x,y){
	if(x === undefined)
		this.x = 0;
	else
		this.x = x;
	if(y === undefined)
		this.y = 0;
	else
		this.y = y;

	this.set = function(x,y){
		this.x = x;
		this.y = y;
	};

	this.setFromRad = function(rayon, angle){
		if(rayon === 0){
			this.x = 0;
			this.y = 0;
		} else {
			this.x = rayon * Math.cos(angle);
			this.y = rayon * Math.sin(angle);
		}
	};

	this.getAngle = function(){
		if(this.y === 0 && this.x>0)
			return 0;
		if(this.y === 0 && this.x>0)
			return Math.PI;
		return Math.atan(this.x/this.y);
	};

	this.getRayon = function(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};

	this.setRayonTo = function(rayon){
		if(this.x === 0 && this.y === 0)
			return;
		
		var h = rayon / this.getRayon();
		this.x *= h;
		this.y *= h;
	};

	this.setFromVect = function(vect){
		this.x = vect.x;
		this.y = vect.y;
	}
	
	this.export = function(){
		return [this.x, this.y];
	}

	this.import = function(obj){
		this.x = obj[0];
		this.y = obj[1];
	}
};

module.exports.Vector2D = Vector2D;

// ---- Objects ---- //

// Animable Object
var animPoint = function(){
	this.toDelete = false;
	this.size = 10;

	// pos en px
	this.pos = new Vector2D();
	this.getPos = function(){ return this.pos };
	this.setPos = function(x,y){ this.pos.set(x,y);	};

	// vit en px / ms
	this.vit = new Vector2D();
	this.getVit = function(){ return this.vit };
	this.setVit = function(x,y){ this.vit.set(x,y); };

	// acc en px / ms²
	this.acc = new Vector2D();
	this.getAcc = function(){ return this.acc };
	this.setAcc = function(x,y){ this.acc.set(x,y);	};

	this.stepAnim = function(t){
		this.vit.x += this.acc.x * t;
		this.vit.y += this.acc.y * t;

		this.pos.x += this.vit.x * t;
		this.pos.y += this.vit.y * t;
	};

	this.drawOn = function(ctx){
		ctx.lineWidth = 1;
		ctx.strokeStyle="rgb(0,0,0)";

		ctx.strokeRect(this.pos.x-this.size/2,this.pos.y-this.size/2,this.size,this.size);
	};

	this.export = function(){
		return [this.pos.export(), this.vit.export(), this.acc.export()];
	}

	this.import = function(obj){
		this.pos.import(obj[0]);
		this.vit.import(obj[1]);
		this.acc.import(obj[2]);
	}
};

module.exports.animPoint = animPoint;

// Orientable Animable Object
var animOrientedPoint = function(){
	// point
	this.animPoint = new animPoint();

	this.getPos = function(){ return this.animPoint.getPos(); };
	this.setPos = function(x,y){ this.animPoint.setPos(x,y); };

	this.getVit = function(){ return this.animPoint.getVit(); };
	this.setVit = function(x,y){ this.animPoint.setVit(x,y); };

	this.getAcc = function(){ return this.animPoint.getAcc(); };
	this.setAcc = function(x,y){ this.animPoint.setAcc(x,y); };

	this.orientVectorSize = 15;
	this.orientVector = new Vector2D(this.orientVectorSize,0);

	this.stepAnim = function(t){
		this.animPoint.stepAnim(t);
	};

	this.drawOn = function(ctx){
		this.animPoint.drawOn(ctx);

		ctx.beginPath();
		ctx.moveTo(this.animPoint.pos.x,this.animPoint.pos.y);
		ctx.lineTo(this.animPoint.pos.x+this.orientVector.x,this.animPoint.pos.y+this.orientVector.y);
		ctx.stroke();
	};

	this.orient = function(angle){
		this.orientVector.setFromRad(orientVectorSize,angle);
	};

	this.orientToThePoint = function(x,y){
		this.orientVector.x = x-this.animPoint.pos.x;
		this.orientVector.y = y-this.animPoint.pos.y;
		this.orientVector.setRayonTo(this.orientVectorSize);
	};

	this.export = function(){
		return [this.animPoint.export(), this.orientVector.export()];
	}

	this.import = function(obj){
		this.animPoint.import(obj[0]);
		this.orientVector.import(obj[1]);
	}
};

module.exports.animOrientedPoint = animOrientedPoint;

// ---- ObjectPool ---- //

var gameObjectPool = function(n){
	this.sizeMax = n;
	this.pool = [];

	this.get = function(key){
		return this.pool[key];
	};

	this.set = function(key,obj){
		if(!this.validObject(obj))
			return new Error('gameObjectPool.addObject obj mal formé : '+obj);
		this.pool[key] = obj;
	};

	this.add = function(obj){
		var key = this.findFreeId();
		if(key instanceof Error)
			return key;
		if(!this.validObject(obj))
			return new Error('gameObjectPool.addObject obj mal formé : '+obj);
		this.pool[key] = obj;
		return key;
	};

	this.validObject = function(obj){
		return true;
	};

	this.findFreeId = function(){
		for(var i=0;i<this.sizeMax;i++)
			if(this.pool[i] === undefined)
				return i;
		return new Error('gameObjectPool.findFreeId plus de place');
	};

	this.remove = function(key){
		if(this.pool[key] === undefined)
			return new Error('gameObjectPool.remove key absente : '+key);
		delete this.pool[key];
	};

	this.export = function(){
		return this.pool;
	};
};

module.exports.gameObjectPool = gameObjectPool;