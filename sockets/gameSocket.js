/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Gestion du socket de jeu
--------------------------------------------------- */

const ent = require('ent');
const log = require('../log');


// ---- Pseudos ---- //
var gamePseudos = [];
const addPseudo = function(pseudo){
	gamePseudos.push(pseudo);
}
const isPseudoPris = function(pseudo){
	return gamePseudos.indexOf(pseudo) !== -1;
}
const deletePseudo = function(pseudo){
	gamePseudos.slice(gamePseudos.indexOf(pseudo),1);
}

// ---- ObjectPool ---- //

var gameObjectPool = [];
const findFreeId = function(array){
	for(var i=0;i<1000;i++)
		if(array[i] === undefined)
			return i;
	log.conLogError('can\'t find free id');
	return -1;
}

// ---- Process ---- //

module.exports.process = function (gameIo,io){
	gameIo.on('connection',	function(socket){
		socket.on('nouveauJoueur', function(bonhome, cb) {
			// Script safe
			bonhome.nom = ent.encode(bonhome.nom);

			// Gesiton des erreurs
			if(bonhome.nom === undefined || bonhome.nom.length === 0){
				cb('pseudoVide');
			} else if(isPseudoPris(bonhome.nom)){
				cb('pseudoPris');
			}
			else {
				log.conLog('Game - nouveauJoueur : '+bonhome.nom);
				// Génération d'une clé d'objet unique
				var key = findFreeId(gameObjectPool);
				if(key === -1){
					cb('plusDePlace');
					return;
				}

				// envois la clé en réponse
				cb(key);
				socket.key = key;

				// Ajout du pseudo à la liste
				addPseudo(bonhome.nom);
				// Ajout de l'objet
				gameObjectPool[key] = bonhome;
				// Fonctions
				socket.updateData = function(data){
					gameObjectPool[this.key].data = data;
					gameObjectPool[this.key].updated = true;
				}

				socket.emit('initObjectPool', gameObjectPool);
				socket.broadcast.emit('newObject', {'key':key, 'obj':bonhome});

				// requier une update de la position
				socket.emit('reqUpdatePos');

				socket.on('newObject', function(object,cb){
					var key = findFreeId(gameObjectPool);
					cb(key);
					gameObjectPool[key] = object;
					socket.broadcast.emit('newObject',{'key':key, 'obj':object});
				});

				socket.on('updatePos', function(response){
					this.updateData(response);
					// broadcast
					socket.broadcast.emit('updateObjectPool',{'key':key, 'data':response});
					socket.emit('reqUpdatePos');
				}); 

				socket.on('deleteObject', function(key){
					socket.broadcast.emit('deleteObject',key);
					delete gameObjectPool[key];
				});

				socket.on('disconnect', function(){
					var nom = gameObjectPool[socket.key].nom;

					log.conLog('Game - disconnect : '+nom);
					deletePseudo(nom);

					delete gameObjectPool[key];
					//socket.broadcast.emit('gameDisconnect', {timeStamp: timeToStr(new Date()), nbUser: listPseudo.length, pseudo: socket.pseudo});
				});
			}
		});
	});
};