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

// Elements Statiques
addElement('text/css\; charset=UTF-8', '/style.css');

// Traitement
module.exports = {
	process : function(request, response, url){
		if(url == null || url.length == 0 || url == '/')
			url = '/index';

		var el;
		// Elements statiques
		if(typeof (el = elements[url]) !== 'undefined'){
			response.writeHead(200, {'Content-Type': el.type,});
			response.write(el.content);
		}
		// Elements JS
		else if(typeof (el = elementsJS[url]) !== 'undefined'){
			response.writeHead(200, {'Content-Type': el.type,});
			response.write(el.content.call());
		}
		else{
			response.writeHead(404, {'Content-Type': 'text/html\; charset=UTF-8'});
			response.write(elementsJS['/error404'].content.call());
		}
		response.end();
	}
};