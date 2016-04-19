/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Modele de page

	Par défaut les pages sont construites une seule
	fois pour éconnomiser le CPU.
	Si le flag 'needToRefresh' est à true lors de la
	requette, la page sera reconstruite.
--------------------------------------------------- */

const encap = require('./encap');

var navPages = [];

var page = function () {
	this.scriptRaw = null;
	this.scriptFile = null;
	this.scriptFileList = [];
	this.scriptOnload = null;

	// ---- Content ---- //
	this.title = 'Titre de page';
	this.header = 'Header';
	this.section = 'Page';
	this.footer = 'Footer';

	// ---- Nav ---- //
	this.url = '';
	this.navName = '';
	this.nav = function(){
		var response = '<ul>';
		for(var i=0;i<navPages.length;i++){
			if(this.url !== navPages[i].url)
				response += '<li><a href="'+navPages[i].url+'">'+navPages[i].navName+'</a></li>';
			else
				response += '<li><a class="pageOuverte" href="'+navPages[i].url+'">'+navPages[i].navName+'</a></li>';
		}
		response += '</ul>';
		return response;
	};
	// Ajouter la page au nav
	this.addToNav = function(){
		navPages.push(this);
		for(var i=0;i<navPages.length;i++)
			navPages.oneTimeRefresh = true;	// Reconstructon des pages avec le nouveau menu
	};

	// ---- FLAGS ---- //
	this.oneTimeRefresh = false;	// Reconstruit la page une seule fois dès que mis a true
	this.needToRefresh = false;		// Si vrai, la page est reconstruire a chaque fois

	// System
	this.current = null;

	// ---- Construction de la page ---- //
	this.refresh = function(){
		var response = '<html>';
		// Debut HEAD
		response += '<head>';
		response += '<title>' + this.title.toString() + '</title>';
		response += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
		response += '<link href="https://fonts.googleapis.com/css?family=Share+Tech+Mono" rel="stylesheet" type="text/css">';
		response += '<link rel="stylesheet" type="text/css" href="style/style.css">';
		if(this.scriptRaw !== null)
			response += '<script>'+this.scriptRaw.toString()+'</script>';
		if(this.scriptFile !== null)
			response += '<script src="'+this.scriptFile.toString()+'"></script>';
		for(var i=0;i<this.scriptFileList.length;i++)
			response += '<script src="'+this.scriptFileList[i].toString()+'"></script>';
		response += '</head>';
		// Fin HEAD
		// BODY
		if(this.scriptOnload !== null)
			response += '<body onload="'+this.scriptOnload.toString()+'">';
		else
			response += '<body>';
		response += '<header>' + '<div class="icon"></div>' + this.header.toString() + '</header>';
		response += '<nav>' + this.nav() + '</nav>';
		response += '<section>' + this.section.toString() + '</section>';
		response += '<footer>' + this.footer.toString() + '</footer>';
		response += '</body>';
		// Fin BODY
		response += '</html>';
		this.current = response;
	};

	// ---- Résultat ---- //
	this.out = function(resquest){
		if(this.oneTimeRefresh===true || this.needToRefresh===true || this.current===null){
			this.oneTimeRefresh = false;
			this.refresh();
			return this.current;
		}
		else
			return this.current;
	};
};

module.exports = page;