/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

var fs = require('fs');

// Hérite de l'objet page
var page = require('./page');
var encap = require('./encap');

var p = Object.create(page);

module.exports = {
	out : function(){ return p.out(); }
};

// Code spécifique
fs.readFile('./pages/clientScript/client.js', function(err, data) {
	if (err) throw err;
	p.script = data;
});

p.title = 'Jouer';

p.header = { toString: function(){
	var response = Object.create(encap).
	h1('Jouer au jeu des familles');
	return response.content;
}};

p.section = { toString: function(){
	var response = Object.create(encap).
	h2('En construction').
	p('Y\'a pas grand chose ici ...').
	p('... à part un script !').
	raw('<button onclick="send()">Lancer</button>').
	raw('<button onclick="clearTimeout(timer)">Stopper</button>').
	p('Résultat :').
	raw('<p id="ajaxResult"></p>');
	return response.content;
}};