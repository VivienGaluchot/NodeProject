/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

var encap = require('./util/encap');

// Hérite de l'objet page
var page = require('./util/page');
var p = new page();

module.exports.out = function(){return p.out();};

// Code spécifique
p.scriptFile = '/clientScript/pingClient.js';

p.title = 'Jouer';

p.header = { toString: function(){
	var response = new encap().
	h1('Jouer au jeu des familles');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('En construction').
	p('Y\'a pas grand chose ici ...').	
	p('<canvas id="pingGraph" class="graph" width="400px" height="100px"></canvas>').
	raw('<button id="startButton" onclick="start()">Ping</button> Résultat : <span id="pingResult">-</span> ms.');
	return response.content;
}};