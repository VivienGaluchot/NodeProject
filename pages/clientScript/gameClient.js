//var gameSocket = io('/game');

var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;
var bonhomeList = [];
var yourBonhome;

addLoadEvent(function(){
	gameCanvas.load();
	lastDraw = new Date();

	var jaque = new bonhome();
	jaque.nom = 'jaque';
	jaque.posX = 100;
	jaque.posY = 100;
	jaque.vitX = 0.1;

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

	var nT = new Date();
	var dT = nT - lastDraw;
	lastDraw = nT;

	ctx.clearRect(0,0,width,height);

	for(var i=0;i<bonhomeList.length;i++){
		bonhomeList[i].stepAnim(dT)
		bonhomeList[i].drawOn(ctx);
	}

	window.requestAnimationFrame(gameCanvas.draw);
};

var bonhome = function(){
	this.nom = null;
	// pos en px
	this.posX = 0;
	this.posY = 0;
	// acc en px² / ms
	this.vitX = 0;
	this.vitY = 0;
	// en rad
	this.lookDirection = 0;

	this.drawOn = function(ctx){
		ctx.strokeStyle="rgba(255,255,255)";
		ctx.strokeRect(this.posX-5,this.posY-5,10,10);
	};

	// t en ms
	this.stepAnim = function(t){
		this.posX += this.vitX * t;
		this.posY += this.vitY * t;
		if(this.posX <= 0) this.vitX = 0.1;
		if(this.posX > gameCanvas.width) this.vitX = -0.1;
	};
};

var goLeft = function(){yourBonhome.vitX = -0.2;};
var goUp = function(){yourBonhome.vitY = -0.2;};
var goRight = function(){yourBonhome.vitX = 0.2;};
var goDown = function(){yourBonhome.vitY = 0.2;};


// ---- Inputs ---- //

var LEFT_ARROW = 37;
var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;
var ENTER = 13;

var leftDown = false;
var upDown = false;
var rightDown = false;
var downDown = false;

var toucheDown = function(event){
	if(event.keyCode === LEFT_ARROW) {
		event.preventDefault();		
		leftDown = true;
		goLeft();
	}
	else if(event.keyCode === UP_ARROW) {
		event.preventDefault();
		upDown = true;
		goUp();
	}
	else if(event.keyCode === RIGHT_ARROW) {
		event.preventDefault();
		rightDown = true;
		goRight();
	}
	else if(event.keyCode === DOWN_ARROW) {
		event.preventDefault();
		downDown = true;
		goDown();
	}
};

var toucheUp = function(event){
	if(event.keyCode === LEFT_ARROW) {
		event.preventDefault();		
		leftDown = false;
		if(!rightDown)
			yourBonhome.vitX = 0;
		else
			goRight();
	}
	else if(event.keyCode === UP_ARROW) {
		event.preventDefault();
		upDown = false;
		if(!downDown)
			yourBonhome.vitY = 0;
		else
			goDown();
	}
	else if(event.keyCode === RIGHT_ARROW) {
		event.preventDefault();
		rightDown = false;
		if(!leftDown)
			yourBonhome.vitX = 0;
		else
			goLeft();
	}
	else if(event.keyCode === DOWN_ARROW) {
		event.preventDefault();
		downDown = false;
		if(!upDown)
			yourBonhome.vitY = 0;
		else
			goUp();
	}
};

var touchePress = function(event){
	// rien encore
};

window.addEventListener('keydown',toucheDown,false);
window.addEventListener('keyup',toucheUp,false);
window.addEventListener('keypress',touchePress,false);