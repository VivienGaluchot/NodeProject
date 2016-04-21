/* ---------------------------------------------------
	By Pellgrain - 12/04/2016

	Gestion des sockets de socket.io
--------------------------------------------------- */

const log = require('./log');
const ent = require('ent');

log.conLog('Chargement de socketProcess');

module.exports = function (io) {
	// ---- CHAT ---- //
	var listPseudo = [];
	var chat = io.of('/chat');
	chat.on('connection',	function(socket){
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

	// ---- GAME ---- //
	var gamePseudos = [];
	var gameObjectPool = [];
	var chat = io.of('/game');
	chat.on('connection',	function(socket){
		socket.on('nouveauJoueur', function(bonhome, cb) {
			// Script safe
			bonhome.nom = ent.encode(bonhome.nom);

			// Gesiton des erreurs
			if(bonhome.nom === undefined || bonhome.nom.length === 0){
				cb('pseudoVide');
			} else if(gamePseudos.indexOf(bonhome.nom) !== -1){
				cb('pseudoPris');
			}
			else {
				log.conLog('Nouveau joueur - '+bonhome.nom);
				// Génération d'une clé d'objet unique
				var key = findFreeId(gameObjectPool);
				if(key === -1)
					return;

				// r'envois la clé en réponse
				cb(key);
				socket.key = key;

				// Ajout du pseudo à la liste
				gamePseudos.push(bonhome.nom);
				// Ajout de l'objet
				gameObjectPool[key] = bonhome;

				socket.emit('initObjectPool', gameObjectPool);
				socket.broadcast.emit('newObject', {'key':key, 'obj':bonhome});
				socket.emit('reqUpdatePos');

				socket.on('newObject', function(object,cb){
					var key = findFreeId(gameObjectPool);
					cb(key);
					gameObjectPool[key] = object;
					socket.broadcast.emit('newObject',{'key':key, 'obj':object});
				});

				socket.on('updatePos', function(response){
					var key = socket.key;
					// mise a jour de data (pour pas perdre le nom)
					gameObjectPool[key].data = response.data;
					// broadcast
					socket.broadcast.emit('updateObjectPool',{'key':key, 'data':response});

					socket.emit('reqUpdatePos');
				}); 

				socket.on('deleteObject', function(key){
					delete gameObjectPool[key];
				});

				socket.on('disconnect', function(){
					gamePseudos.slice(gamePseudos.indexOf(gameObjectPool[socket.key].nom),1);
					delete gameObjectPool[key];

					//socket.broadcast.emit('gameDisconnect', {timeStamp: timeToStr(new Date()), nbUser: listPseudo.length, pseudo: socket.pseudo});
				});
			}
		});
	});

	// ---- PING ---- //
	var ping = io.of('/ping');
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

const findFreeId = function(array){
	for(var i=0;i<1000;i++)
		if(array[i] === undefined)
			return i;

	log.conLogError('can\'t find free id');
	return -1;
}