/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Gestion du socket de jeu
--------------------------------------------------- */

const ent = require('ent');
const log = require('../log');
const util = require('./util');

// ---- Settings ---- //

var mapSize = {'width': 512, 'height': 512};
var dTUpdateCycle = 80;

var gameSettings = {'mapSize':mapSize,'dTUpdateCycle':dTUpdateCycle};


// ---- ObjectPool ---- //
// Limite maximale d'objets dans la pool : 1000
const gameObjectPool = new util.ObjectPool(1000);

// 	Objets pris en charche : {type:t, data:d, toAnimate:bool}
gameObjectPool.validObject = function(obj){
	if(obj.data === undefined || obj.type === undefined || obj.type === 'bonhomme' || obj.type === 'balle')
		return false;
	return true;
};

gameObjectPool.updateData = function(key,data){
	if(this.pool[key] === undefined)
		return new Error('gameObjectPool.updateData key absente : '+key);
	this.pool[key].data = data;
	return 1;
};

gameObjectPool.packForUpdate = function(){
	var result = [];
	for(var i=0;i<this.pool.length;i++){
		if(this.pool[i] != undefined){
			result.push({'key':i, 'data':this.pool[i].data});
		}
	}
	return result;
};

// ---- ObjectPool ---- //
// Limite maximale de socket dans la pool : 10
const gameSocketPool = new util.ObjectPool(4);


// ---- Process ---- //

/*
  Evenements :

	Serveur -> Client
	- initGame : {'settings':data, 'pool':data}
		Envoi l'etat du jeu au client
	- newObject : {'key':key, 'data':data}
		Objet a ajouter a la pool 
	- reqUpdatePos : [{'key':key, 'data':data},...], cb(data)
		Demande une mise a jour de la position
	- updateObjects : [{'key':key, 'data':data},...]
		Informe de la mise a jour de plusieurs objets
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : bonhomme, cb(key/'erreur')
		Informe le serveur de son entré en jeu
	- fire
		// TODO
	- disconnect
		Deconnexion du client
*/

var gameIo;
var io;

var timerUpdateCycle;

var sendUpdate = function(){
	var array = gameObjectPool.packForUpdate();
	gameSocketPool.forEach(function(socket,key){
		if(socket.isMaj){		
			socket.isMaj = false;
			socket.updatePos(array);
		} else {
			log.conLogWarning('Game - sendUpdate : drop du socket ' + key);
		}
	});
};

var startUpdateCycle = function(){
	timerUpdateCycle = setInterval(sendUpdate, dTUpdateCycle);
};

var stopUpdateCycle = function(){
	clearInterval(timerUpdateCycle);
};

var initSocket = function(){
	gameIo.on('connection',	function(socket){
		var clientIp = socket.request.connection.remoteAddress;
		log.conLog('Game - connection from ' + clientIp);

		socket.on('nouveauJoueur', function(bonhomme, cb){
			// XSS safe
			bonhomme.nom = ent.encode(bonhomme.nom);

			// Gestion des erreurs
			if(bonhomme.nom === undefined || bonhomme.nom.length === 0){
				cb('erreur');
				return;
			}

			log.conLog('Game - nouveauJoueur : '+bonhomme.nom);

			// Ajout de l'objet à la pool
			var key = gameObjectPool.add(bonhomme);
			// Erreur
			if(key instanceof Error){
				cb('erreur');
				return;
			}

			// Ajout du socket à la pool
			var sockKey = gameSocketPool.add(socket);
			// Erreur
			if(sockKey instanceof Error){
				gameObjectPool.remove(key);
				cb('erreur');
				return;
			}

			// Envois la clé en réponse
			log.conLogSuite('Key : '+key);
			cb(key);

			// Socket
			socket.key = key;
			socket.sockKey = sockKey;
			socket.isMaj = true;
			socket.updatePos = function(objectsUpdated){
				socket.emit('reqUpdatePos', objectsUpdated, function(data){
					gameObjectPool.updateData(key,data);
					socket.isMaj = true;
				});
			};

			socket.emit('initGame', {'settings':gameSettings, 'pool':gameObjectPool.pack()}, function(){
				log.conLog('Game - initGame effectué: '+socket.key);
			});
			socket.broadcast.emit('newObject', {'key':key, 'data':bonhomme});

//			// TEMPORAIRE
//			socket.on('newObject', function(object,cb){
//				var key = gameObjectPool.add(object);
//				if(key instanceof Error){
//					cb('erreur');
//					return;
//				}
//				cb(key);
//				socket.broadcast.emit('newObject',{'key':key, 'data':object});
//			});

//			// Ne pas faire passer la deletion, dangereux
//			socket.on('deleteObject', function(key){
//				gameObjectPool.remove(key);
//				socket.broadcast.emit('deleteObject',key);
//			}); 
		});

		socket.on('disconnect', function(){
			if(socket.sockKey !== undefined)				
				gameSocketPool.remove(socket.sockKey);
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

module.exports.process = function(_gameIo,_io){
	gameIo = _gameIo;
	io = _io;

	initSocket();
	startUpdateCycle();
};