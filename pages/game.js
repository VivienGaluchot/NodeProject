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
p.scriptFile = '/clientScript/testPing.js';

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
	p('... à part un script !').
	raw('<button onclick="start()">Lancer</button>').
	raw('<button onclick="clearTimeout(timer);started = false;">Stopper</button>').
	p('Résultat :').
	raw('<p id="ajaxResult"></p>');
	return response.content;
}};