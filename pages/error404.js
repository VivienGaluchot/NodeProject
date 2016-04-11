/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'erreur 404
--------------------------------------------------- */

var encap = require('./util/encap');

// Hérite de l'objet page
var page = require('./util/page');
var p = new page();

module.exports.out = function(){return p.out();};

// Code spécifique
p.title = 'Erreur 404';

p.header = { toString: function(){
	var response = new encap().
	h1('Erreur 404');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	p('La page demandée n\'existe pas :(');
	return response.content;
}};