/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'accueil
--------------------------------------------------- */

// Hérite de l'objet page
var page = require('./page');
var encap = require('./encap');

var p = Object.create(page);

module.exports = {
	out : function(){ return p.out(); }
};

// Code spécifique
p.title = 'Accueil';

p.content = {
	toString: function(){
		var response = encap.h1('Accueil');
		response += encap.p('Bienvenue');
		return response;
	}
};