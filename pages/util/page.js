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
	this.scriptOnload = null;

	this.title = 'Titre de page';
	this.header = 'Header';
	this.nav = { toString: function(){
		var response = '<ul>';
		response += '<li><a href="/index">Accueil</a></li>';
		response += '<li><a href="/game">Jeu</a></li>';
		response += '<li><a href="/chat">Chat</a></li>';
		response += '<li><a href="/credit">Credit</a></li>';
		response += '</ul>';
		return response;
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
		response += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
		response += '<link href="https://fonts.googleapis.com/css?family=Share+Tech+Mono" rel="stylesheet" type="text/css">';
		response += '<script src="/socket.io/socket.io.js"></script>';
		response += '<link rel="stylesheet" type="text/css" href="style/style.css">';
		if(this.script !== null)
			response += '<script>'+this.script.toString()+'</script>';
		if(this.scriptFile !== null)
			response += ' <script src="'+this.scriptFile.toString()+'"></script>';
		response += '</head>';
		// Fin HEAD
		// BODY
		if(this.scriptOnload !== null)
			response += '<body onload="'+this.scriptOnload.toString()+'">';
		else
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