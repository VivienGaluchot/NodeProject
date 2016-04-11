/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Programme principal du Serveur NodeJs
--------------------------------------------------- */

// Dependances
var http = require('http');
var https = require('https');
var fs = require('fs');

var url = require('url');
var queryString = require('querystring');
var log = require('./log');
var urlProcess = require('./urlProcess');

var options = {
  key: fs.readFileSync('./keys/serv.key'),
  cert: fs.readFileSync('./keys/serv.crt')
};

/*
	Serveur
*/
var server = http.createServer();
var serverS = https.createServer(options);

// Event handler
var handler = function(request, response){
	// Informations
	var parametres = queryString.parse(url.parse(request.url).query);
	var pageUrl = url.parse(request.url).pathname;

    log.conLog(request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress);
    log.conLogSuite('pageUrl : ' + pageUrl);

    // Process
	urlProcess.process(request, response, pageUrl);
};

server.on('request',handler);
serverS.on('request',handler);


// Mise en écoute
server.listen(8080);
//serverS.listen(8081);
log.conLog('Serveur en écoute');

// Arret du serveur
server.on('close', function() {
	log.conLog('Arret du serveur');
});