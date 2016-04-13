/* ---------------------------------------------------
	By Pellgrain - 12/04/2016

	Gestion des sockets de socket.io
--------------------------------------------------- */

const log = require('./log');
const ent = require('ent');

log.conLog('Chargement de socketProcess');

var listPseudo = [];

module.exports = function (io) {
	// ---- CHAT ---- //
	var chat = io.of('/chat');
	chat.on('connection',	function(socket){
		socket.on('chatNew', function(userPseudo) {
			userPseudo = ent.encode(userPseudo);
			if(listPseudo.indexOf(userPseudo) === -1){
				// Pseudo non utilisé
				socket.pseudo = userPseudo;	
				listPseudo.push(userPseudo);
				var date = timeToStr(new Date());
				socket.broadcast.emit('chatNew', {timeStamp: date, nbUser: listPseudo.length, pseudo: userPseudo});
				socket.emit('chatNew', {timeStamp: date, nbUser: listPseudo.length, pseudo: userPseudo});
				log.conLog('chatNew : '+userPseudo);
			} else {
				// Pseudo déja utilisé
				socket.emit('pseudoPris');
				log.conLog('pseudoPris : '+userPseudo);
			}
		});

		socket.on('chatMessage', function (msg) {
			msg = ent.encode(msg);
			var date = timeToStr(new Date());
			socket.broadcast.emit('chatMessage', {timeStamp: date, pseudo: socket.pseudo, message: msg});
			socket.emit('chatMessage', {timeStamp: date, pseudo: socket.pseudo, message: msg});
			log.conLog('chatMessage - '+socket.pseudo+' : '+msg);
		}); 

		socket.on('disconnect', function(){
			var id = listPseudo.indexOf(socket.pseudo);
			if(id !== -1)
				listPseudo.splice(id,1);		
			socket.broadcast.emit('chatDisconnect', {timeStamp: timeToStr(new Date()), nbUser: listPseudo.length, pseudo: socket.pseudo});
			log.conLog('chatDisconnect : '+socket.pseudo);
		});
	});

	// ---- PING ---- //
	var ping = io.of('/pingTest');
	ping.on('connection', function (socket) {
		socket.on('latency', function (startTime, cb) {
			cb(startTime);
		}); 
	});
};

// TEMP
const timeToStr = function(date){
	return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
};