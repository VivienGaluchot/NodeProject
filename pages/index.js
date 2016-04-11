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
	h1('-- Polydle Project --');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Bienvenue').
	p_('Te voila dans ta chambre, provenant d\'un serveur de développement ').a('http://nodejs.org/','NodeJs')._p('.').
	p_('Le code source du machin est dispo ici : ').a('https://github.com/VivienGaluchot/NodeProject','GitHub')._p('.').
	h2('Informations').
	p('Y\'a pas grand chose !').
	raw('<img src="img/mindmap.png" alt="Map">').
	legend('MindMap').
	p('Alors ca c\'est la MindMap du projet. Une Mind Map se construit comme suit : au centre le thème ou sujet de la Mind Map en image et en mots. Depuis ce centre, des branches en couleur irradient dans toutes les directions en portant les idées principales sous forme de dessins et de mots-clés. Ces branches irradient à leur tour vers des idées secondaires, en image et mot-clé, etc.');
	return response.content;
}};

p.footer = { toString: function(){
	var date = new Date();
	var response = new encap().
	p(date.toString());
	return response.content;
}};