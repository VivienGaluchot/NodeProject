/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Programme principal du Serveur NodeJs
--------------------------------------------------- */

// ---- Includes ---- //

// Utilitaires
const fs = require('fs');
const url = require('url');
const queryString = require('querystring');
const readline = require('readline');
const log = require('./log');

// HTTP, socket.io
const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server);

// HTTPS (TODO : socket.io)
const https = require('https');
const options = {
	key: fs.readFileSync('./keys/serv.key'),
	cert: fs.readFileSync('./keys/serv.crt')
};
const serverS = https.createServer(options);

// Gestion
const urlProcess = require('./urlProcess');
const socketProcess = require('./socketProcess');


// ---- event Handler HTML ---- //

const servHandler = function(request, response){
	// Informations
	// var parametres = queryString.parse(url.parse(request.url).query);
	var pageUrl = url.parse(request.url).pathname;

    // Process
	urlProcess(request, response, pageUrl);
};


// ---- Gestion des sockets ---- //

io.sockets.on('connection', socketProcess);


// ---- Démarage, arret du service ---- //

// Démarrage du serveur HTTP
server.on('request',servHandler);
server.listen(8080);
log.conLog('Serveur HTTP en écoute');

// Démarrage du serveur HTTPS
serverS.on('request',servHandler);
serverS.listen(8081);
log.conLog('Serveur HTTPS en écoute');

// Fermeture de nodeJs
const quit = function(){
	// HTTP
	log.conLog('Fermeture du serveur  HTTP');
	io.close();
	server.close();
	// HTTPS
	log.conLog('Fermeture du serveur  HTTS');
	serverS.close();
	log.conLog('FIN');
	process.exit(1);
};


// ---- Interface console ---- //

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const askStdin = function(){
	rl.question('', function(answer){
		if(answer == 'quit'){
			rl.close();
			quit();
		}
		else
			askStdin();
	});
};

askStdin();