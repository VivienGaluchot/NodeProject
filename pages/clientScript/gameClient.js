//var gameSocket = io('/game');

var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;
var bonhomeList = [];
var balleList = [];
var yourBonhome;

addLoadEvent(function(){
	gameCanvas.load();
	lastDraw = Date.now();

	var jaque = new Bonhome();
	jaque.nom = 'jaque';
	jaque.pos.x = 100;
	jaque.pos.y = 100;

	yourBonhome = jaque;

	bonhomeList.push(jaque);
	gameCanvas.draw();
});

addResizeEvent(function(){
	gameCanvas.resize();
});

gameCanvas.draw = function(){
	var ctx = gameCanvas.ctx;
	var width = gameCanvas.width;
	var height = gameCanvas.height;

	var nT = Date.now();
	var dT = nT - lastDraw;
	lastDraw = nT;

	ctx.clearRect(0,0,width,height);

	for(var i=0;i<bonhomeList.length;i++){
		bonhomeList[i].stepAnim(dT);
		bonhomeList[i].drawOn(ctx);
	}
	for(var i=0;i<balleList.length;i++){
		balleList[i].stepAnim(dT);
		if(balleList[i] !== undefined) // peut disparaitre
			balleList[i].drawOn(ctx);
	}

	window.requestAnimationFrame(gameCanvas.draw);
};

var Bonhome = function(){
	this.nom = null;
	this.vitMax = 0.2;
	this.size = 15;

	// pos en px
	this.pos = new Vector2D();
	// acc en px² / ms
	this.vit = new Vector2D();
	
	// en rad
	this.lookDirectionSize = 20;
	this.lookDirection = new Vector2D();

	// system
	this.mouseX = 0;
	this.mouseY = 0;

	this.drawOn = function(ctx){
		ctx.lineWidth = 1;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeRect(this.pos.x-this.size/2,this.pos.y-this.size/2,this.size,this.size);

		// lookDirection
		ctx.beginPath();
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.lineTo(this.pos.x+this.lookDirection.x,this.pos.y+this.lookDirection.y);
		ctx.stroke();

		// name
		ctx.font = "12px Arial";
		if(this.pos.y<this.size/2+15)
			ctx.fillText(this.nom,this.pos.x - (ctx.measureText(this.nom).width/2),this.pos.y+this.size/2+15);
		else
			ctx.fillText(this.nom,this.pos.x - (ctx.measureText(this.nom).width/2),this.pos.y-this.size/2-3);
	};

	this.stepAnim = function(t){ // t en ms
		this.pos.x += this.vit.x * t;
		this.pos.y += this.vit.y * t;

		// Collisions ext
		var temp = this.size/2;
		if(this.pos.x <= temp) this.pos.x = temp;
		if(this.pos.y <= temp) this.pos.y = temp;
		var temp2 = gameCanvas.width - temp;
		if(this.pos.x > temp2) this.pos.x = temp2;
		var temp3 = gameCanvas.height - temp;
		if(this.pos.y > temp3) this.pos.y = temp3;

		// lookDirection
		this.lookDirection.x = this.mouseX-this.pos.x;
		this.lookDirection.y = this.mouseY-this.pos.y;
		this.lookDirection.setRayonTo(this.lookDirectionSize);
	};

	this.bindKey = function(up,right,down,left){
		this.vit.x = 0;
		this.vit.y = 0;
		if(up !== down){
			if(up){ // vers le haut
				this.vit.y = -1;
			} else { // vert le bas
				this.vit.y = 1;
			}
		}

		if(right !== left){
			if(right){ // vers la droite
				this.vit.x = 1;
			} else { // vert la gauche
				this.vit.x = -1;
			}
		}
		this.vit.setRayonTo(this.vitMax);
	};

	this.lookTo = function(x,y){
		this.mouseX = x;
		this.mouseY = y;
	};

	this.fire = function(){
		var balle = new Balle();
		// position
		balle.pos.x = this.pos.x + this.lookDirection.x;
		balle.pos.y = this.pos.y + this.lookDirection.y;
		// vitesse
		balle.vit.setFromVect(this.lookDirection);
		balle.vit.setRayonTo(balle.vitMax);

		balleList.push(balle);
	};
};

var Balle = function(){
	this.vitMax = 1;
	this.size = 6;

	// pos en px
	this.pos = new Vector2D();
	// acc en px² / ms
	this.vit = new Vector2D();
	/// affichage de la trace
	this.trainee = new Vector2D();

	this.drawOn = function(ctx){		
		ctx.lineWidth = 3;
		ctx.strokeStyle="rgb(255,50,0)";
		// ligne
		ctx.beginPath();
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.lineTo(this.pos.x+this.trainee.x,this.pos.y+this.trainee.y);
		ctx.stroke();
	};

	this.stepAnim = function(t){ // t en ms
		this.trainee.x = -this.vit.x;
		this.trainee.y = -this.vit.y;
		this.trainee.setRayonTo(this.size);

		this.pos.x += this.vit.x * t;
		this.pos.y += this.vit.y * t;

		// Collisions ext
		var temp = this.size/2;
		if(this.pos.x <= temp) this.end();
		if(this.pos.y <= temp) this.end();
		var temp2 = gameCanvas.width - temp;
		if(this.pos.x > temp2) this.end();
		var temp3 = gameCanvas.height - temp;
		if(this.pos.y > temp3) this.end();
	};

	this.end = function(){
		balleList.splice(balleList.indexOf(this),1);
	}
}


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
	if(event.keyCode === ENTER){
		yourBonhome.fire();
	}
};

var mouseEvent = function(event){
	var rect = gameCanvas.element.getBoundingClientRect();
	var mouseX = event.clientX - rect.left;
	var mouseY = event.clientY - rect.top;
	yourBonhome.lookTo(mouseX,mouseY);
};

window.addEventListener('keydown',toucheDown,false);
window.addEventListener('keyup',toucheUp,false);
window.addEventListener('keypress',touchePress,false);
window.addEventListener('mousemove',mouseEvent,false);