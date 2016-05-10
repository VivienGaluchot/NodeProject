/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

const encap = require('./util/encap');

// Hérite de l'objet page
const page = require('./util/page');
var p = new page();

// Code spécifique

// Scripts
p.scriptFileList.push('/socket.io/socket.io.js');
p.scriptFileList.push('/clientScript/util.js');
p.scriptFileList.push('/clientScript/canvas.js');
p.scriptFileList.push('/clientScript/pingClient.js');
p.scriptFileList.push('/clientScript/gameObjects.js');
p.scriptFileList.push('/clientScript/gameClient.js');

// Nav
p.url = '/game';
p.navName = 'Jeu';
p.addToNav();

p.title = 'Jouer';

p.header = { toString: function(){
	var response = new encap().
	h1('Jouer');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('C\'est ici qu\'est le jeu').
	raw('<div class="gameContainer"><canvas id="gameCanvas" class="graph" width="100px" height="100px"></canvas></div>').
	raw('<div class="gameInfo"><b>Informations : </b><div id="infoConnectedState"> - </div><div id="infoPlayerList"> - </div></div>').
	h2('En construction').
	p('Dubordel').	
	p('<canvas id="pingGraph" class="graph" width="840px" height="100px" style="height:100px;"></canvas>').
	raw('<button id="startButton" onclick="start()">Ping</button> Instantané : <span id="pingResult">-</span> ms. Moyenne : <span id="pingMoyen">-</span> ms');
	return response.content;
}};

module.exports.out = function(){return p.out();};
module.exports.url = p.url;
