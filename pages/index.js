/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'accueil
--------------------------------------------------- */

var encap = require('./util/encap');

// Hérite de l'objet page
var page = require('./util/page');
var p = new page();

module.exports.out = function(){return p.out();};

// Code spécifique
// La page doit se reconstruire
p.needToRefresh = true;

p.title = 'Accueil';

p.header = { toString: function(){
	var response = new encap().
	h1('-- Node Project --');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Bienvenue').
	p_('Te voila dans ta chambre, provenant d\'un serveur de développement ').a('http://nodejs.org/','NodeJs')._p('.').
	p_('Le code source du machin est dispo ici : ').a('https://github.com/VivienGaluchot/NodeProject','GitHub')._p('.').
	h2('Informations').
	p('Y\'a pas grand chose pour le moment...').
	p('Ce site web fonctionne avec JavaScript, WebSocket et WebGl.').
	p_('La librairie JavaScript ').a('http://socket.io/','Socket.io')._p(' est utilisée.');
	return response.content;
}};

p.footer = { toString: function(){
	var date = new Date();
	var response = new encap().
	p(date.toString());
	return response.content;
}};