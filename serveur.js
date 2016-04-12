/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Programme principal du Serveur NodeJs
--------------------------------------------------- */


var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);
var fs = require('fs');
var url = require('url');
var queryString = require('querystring');
var ent = require('ent');

/*var https = require('https');
var options = {
	key: fs.readFileSync('./keys/serv.key'),
	cert: fs.readFileSync('./keys/serv.crt')
};
var serverS = https.createServer(options);
serverS.listen(8081);*/

var log = require('./log');
var urlProcess = require('./urlProcess');

// Event handler
var servHandler = function(request, response){
	// Informations
	// var parametres = queryString.parse(url.parse(request.url).query);
	var pageUrl = url.parse(request.url).pathname;

    // Process
	urlProcess.process(request, response, pageUrl);
};

// SOCKET.IO, utilisation des WebSockets
io.sockets.on('connection', function (socket, userPseudo) {
	socket.on('chatNew', function(userPseudo) {
		userPseudo = ent.encode(userPseudo);
		socket.pseudo = userPseudo;		
		var date = timeToStr(new Date());
		socket.broadcast.emit('chatNew', {timeStamp: date, pseudo: userPseudo});
		socket.emit('chatNew', {timeStamp: date, pseudo: userPseudo});
		log.conLog('chatNew : '+userPseudo);
	});

	socket.on('chatMessage', function (msg) {
		msg = ent.encode(msg);
		var date = timeToStr(new Date());
		socket.broadcast.emit('chatMessage', {timeStamp: date, pseudo: socket.pseudo, message: msg});
		socket.emit('chatMessage', {timeStamp: date, pseudo: socket.pseudo, message: msg});
		log.conLog('chatMessage - '+socket.pseudo+' : '+msg);
	}); 

	socket.on('disconnect', function(){
		socket.broadcast.emit('chatDisconnect', {timeStamp: timeToStr(new Date()), pseudo: socket.pseudo});
		log.conLog('chatDisconnect : '+socket.pseudo);
	});
});

// Démarrage du serveur
server.on('request',servHandler);
server.listen(8080);
log.conLog('Serveur en écoute');


// TEMP
var timeToStr = function(date){
	return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
};