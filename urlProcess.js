/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Répartition des URL
	Chargement des fichiers statiques
--------------------------------------------------- */

const log = require('./log');
const url = require('url');
const fs = require('fs');

// ---- Elements ---- //

const elements = {};
const elementsJS = {};

const addElement = function(url, contentType){
	if(elements[url] !== undefined){
		log.conLogWarning('from addElement()');
		log.conLogSuite(url+' is already definned');
	}
	if(contentType === undefined){
		contentType = contentTypeFromUrl(url);
		if(contentType instanceof Error) {
			log.conLogError('from addElement()');
			log.conLogSuite(contentType.message);
			return;
		}
	}
	fs.readFile('./pages'+url, function(err, data) {
		if (err){
			log.conLogError('from addElement()');
			log.conLogSuite(err);
			return;
		}
		elements[url] = {type: contentType, content: data};
		log.conLogSuite(' - '+url);
	});
};

const contentTypeFromUrl = function(url, cb){
	var arr = url.split('.');
	if(arr.length <= 1)
		return new Error('url split(\'.\') error : '+url);		
	var ext = arr[arr.length-1];
	if(ext === 'js')
		return 'text/js\; charset=UTF-8';
	else if(ext === 'css')
		return 'text/css\; charset=UTF-8';
	else if(ext === 'png')
		return 'image/png';
	else
		return new Error('url extention unknown : '+url+' - Extention : '+ext);
};

const addElementJS = function(url, contentType){
	if(elementsJS[url] !== undefined){
		log.conLogWarning('from addElementJS()');
		log.conLogSuite(url+' is already definned');
	}
	if(contentType === undefined)
		contentType = 'text/html\; charset=UTF-8';
	try{
		var object = require('./pages'+url);
		elementsJS[url] = {type: contentType, content: object.out};
		log.conLogSuite(' - '+url);
	} catch (err) {
		log.conLogError('from addElementJS()');
		log.conLogSuite(err);
	}
};

const loadFromJSON = function(url){
	fs.readFile('./'+url, function(err, data) {
		if (err){
			log.conLogError('from loadFromJSON()');
			log.conLogSuite(err);
			return;
		}
		try {
			var obj = JSON.parse(data);
			var i;
			for (i=0;i<obj.elementsJS.length;i++)
				addElementJS(obj.elementsJS[i]);
			for (i=0;i<obj.elements.length;i++)
				addElement(obj.elements[i]);
		} catch (err) {
			log.conLogError('from loadFromJSON()');
			log.conLogSuite(err);
			return;
		}
	});
};

log.conLog('Chargement des éléments');
loadFromJSON('elements.json');

// Traitement
module.exports = function(request, response){
	var reqUrl = url.parse(request.url).pathname;

	// socket.io, gérée par le module
	if(reqUrl.startsWith('/socket.io'))
		return;

	log.conLog((request.headers['x-forwarded-for'] ||
		request.connection.remoteAddress ||
		request.socket.remoteAddress ||
		request.connection.socket.remoteAddress) +
		' - reqUrl : ' + reqUrl);

	if(reqUrl === null || reqUrl.length === 0 || reqUrl === '/')
		reqUrl = '/index';

	var el;
	// Elements statiques
	if(typeof (el = elements[reqUrl]) !== 'undefined'){
		// Cache-Control : le navigeur garde en cache les elements 10 minutes (600s)
		response.writeHead(200, {'Content-Type': el.type, 'Cache-Control': 'max-age=600'});
		response.write(el.content);
	}
	// Elements JS
	else if(typeof (el = elementsJS[reqUrl]) !== 'undefined'){
		response.writeHead(200, {'Content-Type': el.type});
		response.write(el.content.call(request));
	}
	else{
		response.writeHead(404, {'Content-Type': elementsJS['/error404'].type});
		response.write(elementsJS['/error404'].content.call(request));
	}
	response.end();
};