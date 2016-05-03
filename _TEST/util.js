// ---- MultiEvents ---- //

var addLoadEvent = function(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			if (oldonload)
				oldonload();
			func();
		};
	}
};

var addResizeEvent = function(func) {
	var olonresize = window.onresize;
	if (typeof window.onresize != 'function') {
		window.onresize = func;
	} else {
		window.onresize = function() {
			if (olonresize)
				olonresize();
			func();
		};
	}
};

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
	};
	
	this.pack = function(){
		return [this.x, this.y];
	};

	this.unpack = function(obj){
		if(obj === undefined || obj[0] === undefined || obj[1] === undefined)
			return new Error('obj undefined');
		this.x = obj[0];
		this.y = obj[1];
		return 1;
	};
};

// ---- Objects ---- //

// Animable Object
var animPoint = function(){
	this.toDelete = false;
	this.size = 10;
	
	var timer = null;
	var breakingStart = null;
	var self = this;

	// l'objet se stoppe en t ms
	this.setBreak = function(t,d){
		if(timer !== null)
			clearTimeout(timer);
		timer = setTimeout(function(){
			if(t >= 0) {
				self.acc.x = -self.vit.x / t;
				self.acc.y = -self.vit.y / t;
				breakingStart = new Vector2D(self.vit.x,self.vit.y)
			} else {
				self.vit.setFromRad(0,0);
				self.acc.setFromRad(0,0);
			}
		}, d);
	};

	// pos en px
	this.pos = new Vector2D();
	this.getPos = function(){ return this.pos; };
	this.setPos = function(x,y){ this.pos.set(x,y);	};

	// vit en px / ms
	this.vit = new Vector2D();
	this.getVit = function(){ return this.vit; };
	this.setVit = function(x,y){ this.vit.set(x,y); };

	// acc en px / ms²
	this.acc = new Vector2D();
	this.getAcc = function(){ return this.acc; };
	this.setAcc = function(x,y){ this.acc.set(x,y);	};

	this.stepAnim = function(t){
		this.vit.x += this.acc.x * t;
		this.vit.y += this.acc.y * t;

		if(breakingStart !== null){
			if((this.vit.x * breakingStart.x < 0) || (this.vit.y * breakingStart.y < 0)){
				this.vit.set(0,0);
				this.acc.set(0,0);
				breakingStart = null;
			}
		}

		this.pos.x += this.vit.x * t;
		this.pos.y += this.vit.y * t;
	};

	this.drawOn = function(ctx){
		ctx.lineWidth = 1;
		ctx.strokeStyle="rgb(0,0,0)";

		ctx.strokeRect(this.pos.x-this.size/2,this.pos.y-this.size/2,this.size,this.size);
	};

	this.pack = function(){
		return [this.pos.pack(), this.vit.pack(), this.acc.pack()];
	};

	this.unpack = function(obj){
		if(obj === undefined || obj[0] === undefined || obj[1] === undefined || obj[2] === undefined)
			return new Error('obj undefined');
		this.pos.unpack(obj[0]);
		this.vit.unpack(obj[1]);
		this.acc.unpack(obj[2]);
	};
};

// Orientable Animable Object
var animOrientedPoint = function(){
	// point
	this.animPoint = new animPoint();

	this.setBreak = function(t,d){ this.animPoint.setBreak(t,d); };

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

	this.pack = function(){
		return [this.animPoint.pack(), this.orientVector.pack()];
	};

	this.unpack = function(obj){
		if(obj === undefined || obj[0] === undefined || obj[1] === undefined)
			return new Error('obj undefined');
		this.animPoint.unpack(obj[0]);
		this.orientVector.unpack(obj[1]);
	};
};