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
};

var fs = require('fs');
var addElement = function(contentType, url){
	fs.readFile('./pages'+url, function(err, data) {
		if (err) throw err;
		elements[url] = {type: contentType, content: data};
	});
};

// Elements JS
addElementJS('text/html\; charset=UTF-8', '/index');
addElementJS('text/html\; charset=UTF-8', '/error404');
addElementJS('text/html\; charset=UTF-8', '/game');
addElementJS('text/html\; charset=UTF-8', '/chat');
addElementJS('text/html\; charset=UTF-8', '/credit');

// Elements Statiques, chargés en mémoire
// Scripts
addElement('text/js\; charset=UTF-8','/clientScript/pingClient.js');
addElement('text/js\; charset=UTF-8','/clientScript/chatClient.js');
// Style
addElement('text/css\; charset=UTF-8', '/style/style.css');
// Images
addElement('image/png','/img/map.png');
addElement('image/png','/img/mindmap.png');
addElement('image/png','/img/patternBody.png');
addElement('image/png','/img/patternHeader.png');
addElement('image/png','/img/header.png');

// Traitement
module.exports = function(request, response, url){
		// socket.io, gérée par le module
		if(url.startsWith('/socket.io'))
			return;

		log.conLog((request.headers['x-forwarded-for'] ||
			request.connection.remoteAddress ||
			request.socket.remoteAddress ||
			request.connection.socket.remoteAddress) +
			' - url : ' + url);

		if(url === null || url.length === 0 || url === '/')
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
			response.write(el.content.call(request));
		}
		else{
			response.writeHead(404, {'Content-Type': elementsJS['/error404'].type});
			response.write(elementsJS['/error404'].content.call(request));
		}
		response.end();
};