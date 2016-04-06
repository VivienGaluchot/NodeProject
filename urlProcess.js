/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Répartition des URL
	Chargement des fichiers statiques
--------------------------------------------------- */

var log = require('./log');

log.conLog('Chargement des éléments');

// Elements statiques
var elements = {};
var elementsJS = {};

var addElementJS = function(contentType, url){
	var object = require('./pages'+url);
	elementsJS[url] = {type: contentType, content: object.out};
}

var fs = require('fs');
var addElement = function(contentType, url){
	fs.readFile('./pages'+url, function(err, data) {
		if (err) throw err;
		elements[url] = {type: contentType, content: data};
	});
}

// Elements JS
addElementJS('text/html\; charset=UTF-8', '/index');
addElementJS('text/html\; charset=UTF-8', '/error404');
addElementJS('text/html\; charset=UTF-8', '/game');
addElementJS('text/html\; charset=UTF-8', '/credit');

// Elements Statiques, chargés en mémoire
// Style
addElement('text/css\; charset=UTF-8', '/style.css');
// Images
addElement('image/png','/img/map.png');
addElement('image/png','/img/mindmap.png');
addElement('image/png','/img/patternBody.png');
addElement('image/png','/img/patternHeader.png');
addElement('image/png','/img/header.png');

// Traitement
module.exports = {
	process : function(request, response, url){
		if(url == null || url.length == 0 || url == '/')
			url = '/index';

		var el;
		// Elements statiques
		if(typeof (el = elements[url]) !== 'undefined'){
			// Cache-Control : le navigeur garde en cache les elements 10 minutes (600s)
			response.writeHead(200, {'Content-Type': el.type, 'Cache-Control': 'max-age=600'});
			response.write(el.content);
		}
		// Elements JS
		else if(typeof (el = elementsJS[url]) !== 'undefined'){
			response.writeHead(200, {'Content-Type': el.type});
			response.write(el.content.call());
		}
		else{
			response.writeHead(404, {'Content-Type': elementsJS['/error404'].type});
			response.write(elementsJS['/error404'].content.call());
		}
		response.end();
	}
};