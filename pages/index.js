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

p.header = { toString: function(){
	var response = encap.h1('-- Polydle Project --');
	return response;
}};

p.section = { toString: function(){
	var date = new Date();
	var response = encap.h2('Bienvenue');
	response += encap.p('Te voila dans ta chambre, sur le serveur de développement NodeJs');
	response += encap.h2('Informations');
	response += encap.p('Y\'a pas grand chose !');
	response += '<img src="mindmap.png" alt="Map">';
	response += encap.legend('MindMap');
	p.needToRefresh = true;
	return response;
}};

p.footer = { toString: function(){
	var date = new Date();
	var response = encap.p(date.toString());
	return response;
}};