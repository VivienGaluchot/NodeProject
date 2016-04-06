/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Programme principal du Serveur NodeJs
--------------------------------------------------- */

// Dependances
const http = require('http');
const https = require('https');
const fs = require('fs');

const url = require('url');
const queryString = require('querystring');
const log = require('./log');
const urlProcess = require('./urlProcess');

const options = {
  key: fs.readFileSync('./keys/serv.key'),
  cert: fs.readFileSync('./keys/serv.crt')
};

/*
	Serveur
*/
const server = http.createServer();
const serverS = https.createServer(options);

// Event request
const event = function(request, response){
	// Informations
	var parametres = queryString.parse(url.parse(request.url).query);
	var pageUrl = url.parse(request.url).pathname;

    log.conLog(request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress);
    log.conLogSuite('pageUrl : ' + pageUrl);

    // Process
	urlProcess.process(request, response, pageUrl);
};

server.on('request',event);
serverS.on('request',event);


// Mise en écoute
server.listen(8080);
serverS.listen(8081);
log.conLog('Serveur en écoute');

// Arret du serveur
server.on('close', function() {
	log.conLog('Arret du serveur')
})