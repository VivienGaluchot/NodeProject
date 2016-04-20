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

// ---- Objects ---- //

// Animable Object
var animPoint = function(){
	this.toDelete = false;
	this.size = 10;

	// pos en px
	this.pos = new Vector2D();
	// vit en px / ms
	this.vit = new Vector2D();
	// acc en px / ms²
	this.acc = new Vector2D();

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

// Orientable Animable Object
var animOrientedPoint = function(){
	this.toDelete = false;
	this.size = 10;

	this.orientVector = new Vector2D(1,1);
	this.orientVectorSize = 15;

	// pos en px
	this.pos = new Vector2D();
	// vit en px / ms
	this.vit = new Vector2D();
	// acc en px / ms²
	this.acc = new Vector2D();

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

		ctx.beginPath();
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.lineTo(this.pos.x+this.orientVector.x,this.pos.y+this.orientVector.y);
		ctx.stroke();
	};

	this.orient = function(angle){
		this.orientVector.setFromRad(orientVectorSize,angle);
	};

	this.orientToThePoint = function(x,y){
		this.orientVector.x = x-this.pos.x;
		this.orientVector.y = y-this.pos.y;
		this.orientVector.setRayonTo(this.orientVectorSize);
	};

	this.export = function(){
		return [this.pos.export(), this.vit.export(), this.acc.export(), this.orientVector.export()];
	}

	this.import = function(obj){
		this.pos.import(obj[0]);
		this.vit.import(obj[1]);
		this.acc.import(obj[2]);
		this.orientVector.import(obj[3]);
	}
};