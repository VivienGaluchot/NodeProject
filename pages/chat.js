/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page de chat
--------------------------------------------------- */


var encap = require('./util/encap');

// Hérite de l'objet page
var page = require('./util/page');
var p = new page();

module.exports.out = function(){return p.out();};
// Code spécifique
// p.scriptFile = '/clientScript/client.js';

p.title = 'Chater';

p.header = { toString: function(){
	var response = new encap().
	h1('Chater avec des gens');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Raconte des trucs !').
	p('Ceci est un chat en direct avec des gens.').
	p('Attention, aucune vérification n\'est faite sur l\'authenticité des utilisateurs.').
	raw('<textarea id="chatArea" cols="50" rows="5"></textarea>');
	return response.content;
}};