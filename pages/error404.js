/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'erreur 404
--------------------------------------------------- */

// Hérite de l'objet page
var page = require('./page');
var encap = require('./encap');

var p = Object.create(page);

module.exports = {
	out : function(){ return p.out(); }
};

// Code spécifique
p.title = 'Erreur 404';

p.header = { toString: function(){
	var response = Object.create(encap).
	h1('Erreur 404');
	return response.content;
}};

p.section = { toString: function(){
	var response = Object.create(encap).
	p('La page demandée n\'existe pas :(');
	return response.content;
}};