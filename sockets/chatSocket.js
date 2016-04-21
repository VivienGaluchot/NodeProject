/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Gestion du socket de chat
--------------------------------------------------- */

const ent = require('ent');
const log = require('../log');

var listPseudo = [];

const timeToStr = function(date){
	return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
};

module.exports.process = function (chatIo){
	chatIo.on('connection',	function(socket){
		socket.on('chatNew', function(userPseudo) {
			if(userPseudo != undefined && userPseudo.length > 0){
				userPseudo = ent.encode(userPseudo);
				if(listPseudo.indexOf(userPseudo) === -1){
					// Pseudo non utilisé
					socket.pseudo = userPseudo;	
					listPseudo.push(userPseudo);
					var date = timeToStr(new Date());
					socket.broadcast.emit('chatNew', {timeStamp: date, nbUser: listPseudo.length, pseudo: userPseudo});
					socket.emit('chatNew', {timeStamp: date, nbUser: listPseudo.length, pseudo: userPseudo});
					log.conLog('chatNew : '+userPseudo);

					// Ajout des evenements
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
				} else {
					// Pseudo déja utilisé
					socket.emit('pseudoPris');
					log.conLog('pseudoPris : '+userPseudo);
				}
			} else {
				socket.emit('pseudoVide');
				log.conLog('chatNew error : pseudoVide');
			}
		});
	});
};