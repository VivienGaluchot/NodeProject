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
p.title = 'Jouer';

p.header = { toString: function(){
	var response = Object.create(encap).
	h1('Jouer au jeu des familles');
	return response.content;
}};

p.section = { toString: function(){
	var response = Object.create(encap).
	h2('En construction').
	p('Y\'a pas grand chose ici ...');
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