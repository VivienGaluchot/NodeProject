/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Modele de page

	Par défaut les pages sont construites une seule
	fois pour éconnomiser le CPU.
	Si le flag 'needToRefresh' est à true lors de la
	requette, la page sera reconstruite.
--------------------------------------------------- */

var encap = require('./encap');

var page = function () {
	this.script = null;
	this.scriptFile = null;

	this.title = 'Titre de page';
	this.header = 'Header';
	this.nav = { toString: function(){
		var response = new encap().
		a('/index','Accueil').
		a('/game','Jeu').
		a('/chat','Chat').
		a('/credit','Credit');
		return response.content;
	}};
	this.section = 'Page';
	this.footer = 'Footer';

	// System
	this.needToRefresh = false;
	this.current = null;

	this.refresh = function(){
		var response = '<html>';
		// Debut HEAD
		response += '<head>';
		response += '<title>' + this.title.toString() + '</title>';
		response += '<link href="https://fonts.googleapis.com/css?family=Share+Tech+Mono" rel="stylesheet" type="text/css">';
		response += '<link rel="stylesheet" type="text/css" href="style/style.css">';
		if(this.script !== null)
			response += '<script>'+this.script.toString()+'</script>';
		if(this.scriptFile !== null)
			response += ' <script src="'+this.scriptFile.toString()+'"></script>';
		response += '</head>';
		// Fin HEAD
		// BODY
		response += '<body>';
		response += '<header>' + '<div class="icon"></div>' + this.header.toString() + '</header>';
		response += '<nav>' + this.nav.toString() + '</nav>';
		response += '<section>' + this.section.toString() + '</section>';
		response += '<footer>' + this.footer.toString() + '</footer>';
		response += '</body>';
		// Fin BODY
		response += '</html>';
		this.current = response;
	};

	this.out = function(){
		if(this.needToRefresh || this.current===null){
			this.refresh();
			return this.current;
		}
		else
			return this.current;
	};
};

module.exports = page;