//var gameSocket = io('/game');

var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;
var bonhomeList = [];
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
		bonhomeList[i].stepAnim(dT)
		bonhomeList[i].drawOn(ctx);
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
	this.lookDirection = 0;

	this.drawOn = function(ctx){
		ctx.strokeStyle="rgba(255,255,255)";
		ctx.strokeRect(this.pos.x-this.size/2,this.pos.y-this.size/2,this.size,this.size);
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
	}
};


// ---- Inputs ---- //

var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;
var LEFT_ARROW = 37;
var ENTER = 13;

var keyUpDown = false;
var keyRightDown = false;
var keyDownDown = false;
var keyLeftDown = false;

var toucheDown = function(event){
	if(event.keyCode === UP_ARROW) {
		event.preventDefault();
		keyUpDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW) {
		event.preventDefault();
		keyRightDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW) {
		event.preventDefault();
		keyDownDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW) {
		event.preventDefault();		
		keyLeftDown = true;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
};

var toucheUp = function(event){
	if(event.keyCode === UP_ARROW) {
		event.preventDefault();
		keyUpDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === RIGHT_ARROW) {
		event.preventDefault();
		keyRightDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
	else if(event.keyCode === DOWN_ARROW) {
		event.preventDefault();
		keyDownDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	} else if(event.keyCode === LEFT_ARROW) {
		event.preventDefault();		
		keyLeftDown = false;
		yourBonhome.bindKey(keyUpDown,keyRightDown,keyDownDown,keyLeftDown);
	}
};

var touchePress = function(event){
	// rien encore
};

window.addEventListener('keydown',toucheDown,false);
window.addEventListener('keyup',toucheUp,false);
window.addEventListener('keypress',touchePress,false);