/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Page d'erreur 404
--------------------------------------------------- */

const encap = require('./util/encap');

// Hérite de l'objet page
const page = require('./util/page');
var p = new page();

p.url = '/error404';

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

module.exports.out = function(){return p.out();};
module.exports.url = p.url;