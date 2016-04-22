/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Gestion du socket de jeu
--------------------------------------------------- */

const ent = require('ent');
const log = require('../log');
const util = require('./util');

// ---- Settings ---- //

var mapSize = {'width': 512, 'height': 512};


// ---- ObjectPool ---- //

const gameObjectPool = new util.gameObjectPool(100);

// 	Objets pris en charche : {type:t, data:d, toAnimate:bool}
gameObjectPool.validObject = function(obj){
	if(obj.data === undefined || obj.type === undefined || obj.type === 'bonhome' || obj.type === 'balle')
		return false;
	return true;
};

gameObjectPool.updateData = function(key,data){
	if(this.pool[key] === undefined)
		return new Error('gameObjectPool.updateData key absente : '+key);
	this.pool[key].data = data;
	return 1;
};


// ---- Process ---- //

/*
  Evenements :

	Serveur -> Client
	- initObjectPool : data
		Envoi l'ensemble des objets au client
	- newObject : {'key':key, 'data':data}
		Objet a ajouter a la pool 
	- reqUpdatePos : null, cb(data)
		Demande une mise a jour de la position
	- updateObject : {'key':key, 'data':data}
		Informe de la mise a jour d'un objet 
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : bonhome, cb(key/'pseudoVide'/'erreur')
		Informe le serveur de son entré en jeu
	- newObject
		// TEMPORAIRE
	- fire
		// TODO
	- disconnect
		Deconnexion du client
*/

module.exports.process = function (gameIo,io){
	gameIo.on('connection',	function(socket){
		var clientIp = socket.request.connection.remoteAddress;
		log.conLog('Game - connection from ' + clientIp);

		socket.on('nouveauJoueur', function(bonhome, cb){
			// XSS safe
			bonhome.nom = ent.encode(bonhome.nom);

			// Gestion des erreurs
			if(bonhome.nom === undefined || bonhome.nom.length === 0){
				cb('pseudoVide');
				return;
			}

			log.conLog('Game - nouveauJoueur : '+bonhome.nom);

			// Ajout de l'objet
			var key = gameObjectPool.add(bonhome);
			// Erreur
			if(key instanceof Error){
				cb('erreur');
				return;
			}
			// Envois la clé en réponse
			log.conLogSuite('Key : '+key);
			cb(key);

			// Socket
			socket.key = key;
			socket.updatePos = function(){
				socket.emit('reqUpdatePos',null,function(data){
					gameObjectPool.updateData(key,data);
					socket.broadcast.emit('updateObject',{'key':key, 'data':data});
				});
			};

			socket.emit('initObjectPool', gameObjectPool.pack(), function(){
				log.conLog('Game - initObjectPool effectué: '+socket.key);
			});
			socket.broadcast.emit('newObject', {'key':key, 'data':bonhome});

			// TEMPORAIRE
			socket.on('newObject', function(object,cb){
				var key = gameObjectPool.add(object);
				if(key instanceof Error){
					cb('erreur');
					return;
				}
				cb(key);
				socket.broadcast.emit('newObject',{'key':key, 'data':object});
			});

//			// Ne pas faire passer la deletion, dangereux
//			socket.on('deleteObject', function(key){
//				gameObjectPool.remove(key);
//				socket.broadcast.emit('deleteObject',key);
//			}); 
		});

		socket.on('disconnect', function(){
			if(socket.key !== undefined){
				socket.broadcast.emit('departDuJoueur', socket.key);
				var obj = gameObjectPool.get(socket.key);
				if(obj !== undefined && obj.nom !== undefined)
					log.conLog('Game - disconnect ' + obj.nom + ', key:' + socket.key +', ip:'+clientIp+'');
				gameObjectPool.remove(socket.key);
			}
			else
				log.conLog('Game - disconnect ip:' + clientIp);
		});
	});
};