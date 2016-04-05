/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

// Hérite de l'objet page
var page = require('./page');
var encap = require('./encap');

var p = Object.create(page);

module.exports = {
	out : function(){ return p.out(); }
};

// Code spécifique
p.title = 'Credit';

p.header = { toString: function(){
	var response = Object.create(encap).
	h1('Crédit');
	return response.content;
}};

p.section = { toString: function(){
	var response = Object.create(encap).
	h2('Fait par des gens').
	p("C'est nous qu'on l'a fait oui !");
	return response.content;
}};

p.footer = { toString: function(){
	var date = new Date();
	var response = Object.create(encap).
	p(date.toString());
	// Pour que la page se reconstruise a chaque chargement
	p.needToRefresh = true;
	return response.content;
}};