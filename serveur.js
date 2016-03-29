/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Programme principal du Serveur NodeJs
--------------------------------------------------- */

// Dependances
var http = require('http');
var url = require('url');
var queryString = require('querystring');
var log = require('./log');
var urlProcess = require('./urlProcess');

/*
	Serveur
*/
var server = http.createServer();

// Event request
server.on('request',function (request, response) {
	// Informations
	var parametres = queryString.parse(url.parse(request.url).query);
	var pageUrl = url.parse(request.url).pathname;

    log.conLog('pageUrl : ' + pageUrl);

    // Process
	urlProcess.process(request, response, pageUrl);
});

// TimeOut de 20s
server.setTimeout(20000,log.conLog('Timeout'));

// Mise en écoute
server.listen(8080);
log.conLog('Serveur en écoute');

// Arret du serveur
server.on('close', function() {
	log.conLog('Arret du serveur')
})