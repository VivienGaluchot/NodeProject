//var gameSocket = io('/game');

var gameCanvas = new canvasObj('gameCanvas');

addLoadEvent(function(){
	gameCanvas.load();
});

addResizeEvent(function(){
	gameCanvas.resize();
});

var draw = function(){

};