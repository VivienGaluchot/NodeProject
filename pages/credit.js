/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

// Hérite de l'objet page
var page = require('./util/page');
var encap = require('./util/encap');

var p = new page();

module.exports.out = function(){return p.out();};

// Code spécifique
// Pour que la page se reconstruise a chaque chargement
p.needToRefresh = false;
p.title = 'Credit';

p.header = { toString: function(){
	var response = new encap().
	h1('Crédit');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Fait par des gens').
	p("C'est nous qu'on l'a fait oui !");
	return response.content;
}};