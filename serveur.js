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


// ---- Gestion du serveur ---- //

const urlProcess = require('./urlProcess');

// Démarrage du serveur HTTP
server.on('request',urlProcess);
server.listen(8080);
log.conLog('Serveur HTTP en écoute');

// Démarrage du serveur HTTPS
serverS.on('request',urlProcess);
serverS.listen(8081);
log.conLog('Serveur HTTPS en écoute');

// ---- Gestion des sockets ---- //

const socketProcess = require('./socketProcess');
socketProcess(io);

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