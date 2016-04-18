var socket = io('/game');

var canGame = new canvasObj('gameCanvas');

window.onload = function(){
	canGame.load();
};

window.onresize = function(){
	canGame.resize();
};

var draw = function(){

}