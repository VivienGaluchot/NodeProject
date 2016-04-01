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
	var response = encap.h1('Accueil');
	return response;
}};

p.section = { toString: function(){
	var date = new Date();
	var response = encap.p('Bienvenue');
	response += encap.p('Time : '+date.getHours()+'h'+date.getMinutes()+'m'+date.getSeconds()+'s');
	response += '<img src="map.png" alt="Map">';
	p.needToRefresh = true;
	return response;
}};