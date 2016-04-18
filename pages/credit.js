/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page du jeu
--------------------------------------------------- */

// Hérite de l'objet page
const page = require('./util/page');
const encap = require('./util/encap');

var p = new page();

// Code spécifique
// Pour que la page se reconstruise a chaque chargement
p.needToRefresh = false;
p.title = 'Credit';

// Nav
p.url = '/cred';
p.navName = 'Credit';
p.addToNav();

p.header = { toString: function(){
	var response = new encap().
	h1('Crédit');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Fait par des gens').
	p("C'est nous qu'on l'a fait oui !");
	return response.content;
}};

module.exports.out = function(){return p.out();};
module.exports.url = p.url;