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

	this.setFromVect = function(vect){
		this.x = vect.x;
		this.y = vect.y;
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
		return Math.atan2(this.y, this.x);
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
	var self = this;
	// Utilisé pour le dessin pas défaut
	this.size = 10;

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

	// fonctions d'animation
	this.updateVit = null;
	this.updatePos = null;

	// l'objet se stoppe en t ms
	this.setBreak = function(t){
		if(t >= 0) {
			self.acc.x = -self.vit.x / t;
			self.acc.y = -self.vit.y / t;
			var breakingStart = new Vector2D(self.vit.x,self.vit.y);
			self.updatePos = null;
			self.updateVit = function(){
				if((self.vit.x * breakingStart.x < 0) || (self.vit.y * breakingStart.y < 0)){
					self.vit.set(0,0);
					self.acc.set(0,0);
					breakingStart = null;
					self.updateVit = null;
				} else {
					self.vit.x += self.acc.x * t;
					self.vit.y += self.acc.y * t;
				}
			};
		} else { // Stop
			self.vit.setFromRad(0,0);
			self.acc.setFromRad(0,0);
			self.updateVit = null;
		}
	};

	// TODO
	// l'objet se dirive vers Pf en T ms et arrive avec la vitesse Vf
	this.goSmoothTo = function(T,Pf,Vf){
		var traj = computeSmoothTraj(0,T,self.pos,Pf,self.vit,Vf);
		self.updateVit = null;
		self.updatePos = function(t){
		};
	};

	this.stepAnim = function(t){
		if(typeof this.updateVit === 'function')
			this.updateVit(t);
		else{
			this.vit.x += this.acc.x * t;
			this.vit.y += this.acc.y * t;
		}

		if(typeof this.updatePos === 'function')
			this.updateVit(t);
		else{
			this.pos.x += this.vit.x * t;
			this.pos.y += this.vit.y * t;
		}
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
		return true;
	};
};

// Orientable Animable Object
var animOrientedPoint = function(){
	var self = this;
	// point
	this.animPoint = new animPoint();

	this.setBreak = function(t,d){ this.animPoint.setBreak(t,d); };

	this.getPos = function(){ return this.animPoint.getPos(); };
	this.setPos = function(x,y){ this.animPoint.setPos(x,y); };

	this.getVit = function(){ return this.animPoint.getVit(); };
	this.setVit = function(x,y){ this.animPoint.setVit(x,y); };

	this.getAcc = function(){ return this.animPoint.getAcc(); };
	this.setAcc = function(x,y){ this.animPoint.setAcc(x,y); };

	// Orientvector
	this.orientVectorSize = 15;
	this.orientVector = new Vector2D(0,-this.orientVectorSize);
	this.orientVector.pack = function(){
		return self.orientVector.getAngle();
	};
	this.orientVector.unpack = function(angle){
		self.orientVector.setFromRad(self.orientVectorSize,angle);
	};

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
		return true;
	};
};


// ---- Math ---- //

var computeSmoothTraj = function(To,Tf,Po,Pf,Vo,Vf){
/*	if(typeof To !== Number || typeof Tf !== Number ||
		typeof Po.x !== Number || typeof Po.y !== Number ||
		typeof Pf.x !== Number || typeof Pf.y !== Number ||
		typeof Vo.x !== Number || typeof Vo.y !== Number ||
		typeof Vf.x !== Number || typeof Vf.y !== Number)
		return ;*/

	var T = Tf - To;

	var A = {'x':0, 'y':0};
	var B = {'x':0, 'y':0};
	var C = {'x':0, 'y':0};
	var D = {'x':0, 'y':0};

	D.x = Po.x;
	C.x = Vo.x;
	B.x = ( 3*(Pf.x - Po.x)/T - (Vf.x + 2*Vo.x) )/T;
	A.x = (Vf.x - Vo.x - 2*B.x*T) / (3*T*T);

	D.y = Po.y;
	C.y = Vo.y;
	B.y = ( 3*(Pf.y - Po.y)/T - (Vf.y + 2*Vo.y) )/T;
	A.y = (Vf.y - Vo.y - 2*B.y*T) / (3*T*T);

	var pos = function(time){
		var t = time-To;
		this.t3 = t*t*t;
		this.t2 = t*t;

		this.A = {'x':A.x, 'y':A.y};
		this.B = {'x':B.x, 'y':B.y};
		this.C = {'x':C.x, 'y':C.y};
		this.D = {'x':D.x, 'y':D.y};

		var P = {'x':0, 'y':0};
		P.x = this.A.x*t3 + this.B.x*t2+ this.C.x*t + this.D.x;
		P.y = this.A.y*t3 + this.B.y*t2+ this.C.y*t + this.D.y;
		return P;
	};

	var vit = function(time){
		var t = time-To;
		this.t2 = t*t;

		this.A = {'x':A.x, 'y':A.y};
		this.B = {'x':B.x, 'y':B.y};
		this.C = {'x':C.x, 'y':C.y};

		var V = {'x':0, 'y':0};
		V.x = this.A.x*t2*3 + this.B.x*t*2+ this.C.x;
		V.y = this.A.y*t2*3 + this.B.y*t*2+ this.C.y;
		return V;
	};

	return {'pos':pos ,'vit':vit};
};