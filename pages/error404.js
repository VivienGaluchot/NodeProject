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
p.title = '404';

p.content = {
	toString: function(){
		var response = encap.h1('404');
		response += encap.p('La page n\'existe pas :(');
		return response;
	}
};