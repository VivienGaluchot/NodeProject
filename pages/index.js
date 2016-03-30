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
		var date = new Date();
		var response = encap.h1('Accueil');
		response += encap.p('Bienvenue');
		response += encap.p('Time : '+date.getHours()+'h'+date.getSeconds());
		return response;
	}
};