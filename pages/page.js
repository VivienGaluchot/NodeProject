/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Modele de page

	Par défaut les pages sont construites une seule
	fois pour éconnomiser le CPU.
	Si le flag 'needToRefresh' est à true lors de la
	requette, la page sera reconstruite.
--------------------------------------------------- */

var encap = require('./encap');

module.exports = {
	// Données
	title: 'Titre de page',
	header: 'Header',
	nav : { toString: function(){
		var response = Object.create(encap).
		a('/index','Accueil').
		a('/game','Jeu').
		a('/credit','Credit');
		return response.content;
	}},
	section: 'Page',
	footer: 'Footer',

	// System
	needToRefresh: true,
	current:'',

	refresh: function(){
		var response = '<html><head>';		
		response += '<meta charset=UTF-8>';
		response += '<title>' + this.title.toString() + '</title>';
		response += '<link href="https://fonts.googleapis.com/css?family=Share+Tech+Mono" rel="stylesheet" type="text/css">';
		response += '<link rel="stylesheet" type="text/css" href="style.css">';
		response += '</head><body>';
		response += '<header>' + '<div class="icon"></div>' + this.header.toString() + '</header>';
		response += '<nav>' + this.nav.toString() + '</nav>';
		response += '<section>' + this.section.toString() + '</section>';
		response += '<footer>' + this.footer.toString() + '</footer>';
		response += '</body></html>';
		this.current = response;
	},
	out: function(){
		if(!this.needToRefresh)
			return this.current;
		else {
			this.refresh();
			return this.current;
		}
	}
};