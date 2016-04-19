//var gameSocket = io('/game');

var gameCanvas = new canvasObj('gameCanvas');

var lastDraw = null;
var bonhomeList = [];

addLoadEvent(function(){
	gameCanvas.load();
	lastDraw = new Date();

	var jaque = new bonhome();
	bonhomeList.push(jaque);
	jaque.posX = 100;
	jaque.posY = 100;
	jaque.vitX = 0.1;
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
	// pos en px
	this.posX = 0;
	this.posY = 0;
	// acc en px² / ms
	this.vitX = 0;
	this.vitY = 0;
	// en rad
	this.lookDirection = 0;

	this.drawOn = function(ctx){
		ctx.rect(this.posX-5,this.posY-5,10,10);
		ctx.stroke();
	};

	// t en ms
	this.stepAnim = function(t){
		this.posX += this.vitX * t;
		this.posY += this.vitY * t;
	}
}