/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'erreur 404
--------------------------------------------------- */

// Hérite de l'objet page
var page = require('./page');

var p = Object.create(page);

module.exports = {
	out : function(){ return p.out(); }
};

// Code spécifique
p.title = '404 :(';

p.content = function(){
	return '<h1>Erreur 404</h1>';
};