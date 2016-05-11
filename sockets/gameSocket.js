/* ---------------------------------------------------
	By Pellgrain - 21/04/2016

	Gestion du socket de jeu
--------------------------------------------------- */

const ent = require('ent');
const log = require('../log');
const util = require('./util');
const gameObjects = require('./gameObjects');

// ---- Settings ---- //

var mapSize = {'width': 512, 'height': 512};
// Cycles d'animation de 10ms
var dTComputeCyle = 10;
// Update tout les 5 cycles
var periodUpdate = 5;

var gameSettings = {'mapSize':mapSize,'dTUpdateCycle':dTComputeCyle*periodUpdate};

// Collisions
gameObjects.setBounds(mapSize);


// ---- ObjectPool ---- //
// Limite maximale d'objets dans la pool : 1000
const gameObjectPool = new util.ObjectPool(1000);

// 	Objets pris en charche : {type:t, data:d, toAnimate:bool}
gameObjectPool.validObject = function(obj){
	if(obj.type === undefined || (obj.type !== 'Bonhomme' && obj.type !== 'Balle')){
		log.conLogWarning('gameObjectPool.validObject, obj.type:'+obj.type);
		return false;
	}
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
	gameObjectPool.forEach(function(obj,key){
		result.push({'key':key, 'data':obj.packP()});
	});
	return result;
};

// ---- ObjectPool ---- //
// Limite maximale de socket dans la pool : 10
const gameSocketPool = new util.ObjectPool(10);


// ---- Process ---- //

/*
  Evenements :

	Serveur -> Client
	- initGame : {'settings':data, 'pool':data}
		Envoi l'etat du jeu au client
	- newObject : {'key':key, 'data':data}
		Objet a ajouter a la pool 
	- reqUpdatePos : objectsUpdated, cb({'mov':movDir,'look':lookDir})
		Demande une mise a jour de la position
	- updateObjects : [{'key':key, 'data':data},...,{'key':key, 'toDelete':true},{'key':key, 'hit':true},...]
		Informe de la mise a jour de plusieurs objets
	- deleteObject : key
		Informe de la suppression d'un objet 
	- departDuJoueur : key
		Informe de la déconnection d'un client

	Client -> Serveur
	- nouveauJoueur : pseudo, cb(key/'erreur')
		Informe le serveur de son entré en jeu
	- fire
		// TODO
	- disconnect
		Deconnexion du client
*/

var gameIo;
var io;

var timerUpdateCycle;

var startUpdateCycle = function(){
	timerUpdateCycle = setInterval(updateCycle, dTComputeCyle);
};

var nCycleCounter = 0;
var updateCycle = function(){
	nCycleCounter ++;
	// Maj des positions
	gameObjectPool.forEach(function(object,key){
		object.stepAnim(dTComputeCyle);

		// Arret du bonhomme avant l'envoi
		if(nCycleCounter >= periodUpdate && object.type === "Bonhomme")
			object.P.getVit().set(0,0);

		// test hit
		if(object.type === "Balle"){
			gameObjectPool.forEach(function(object2,key2){
				if(object2.type === "Bonhomme" && key !== key2 && object.toDelete === false && object2.isHitBy(object)){
					// Hit !
					object.toDelete = true;
					// Maj score dad
					object.dad.score++;
					object.dad.toMaj.score = true;
					// Emit
					gameIo.emit('updateObjects', [
						{'key': object.dad.key , 'data': object.dad.packMaj()},
						{'key': key2, 'hit': true},
						{'key': key, 'toDelete': true}
					]);
				}
			});
		}
	});

	if(nCycleCounter >= periodUpdate){
		// Envoi de la maj
		var array = gameObjectPool.packForUpdate();
		gameSocketPool.forEach(function(socket,key){
			if(socket.isMaj){	
				socket.isMaj = false;
				socket.updatePos(array);
			}/* else {
				log.conLogWarning('Game - updateCycle : drop du socket ' + key);
			}*/
		});

		nCycleCounter = 0
	}

	gameObjectPool.forEach(function(object,key){
		if(object.toDelete === true){
			gameObjectPool.remove(key);
		}
	});
};

var stopUpdateCycle = function(){
	clearInterval(timerUpdateCycle);
};

// Socket

var initSocket = function(){
	gameIo.on('connection',	function(socket){
		var clientIp = socket.request.connection.remoteAddress;
		log.conLog('Game - connection from ' + clientIp);

		socket.on('nouveauJoueur', function(pseudo, cb){
			// XSS safe
			pseudo = ent.encode(pseudo);

			// Gestion des erreurs
			if(pseudo === undefined || pseudo.length === 0){
				cb('erreur');				
				log.conLogWarning('nom Error');
				return;
			}

			log.conLog('Game - nouveauJoueur : '+pseudo);

			var jaque = new gameObjects.Bonhomme();
			jaque.nom = pseudo;
			jaque.score = 10;
			jaque.P.setPos(mapSize.width/2,mapSize.height/2);

			// Ajout de l'objet à la pool
			var key = gameObjectPool.add(jaque);
			jaque.key = key;
			// Erreur
			if(key instanceof Error){
				cb('erreur');
				log.conLogWarning('key Error');
				return;
			}

			// Ajout du socket à la pool
			var sockKey = gameSocketPool.add(socket);
			// Erreur
			if(sockKey instanceof Error){
				gameObjectPool.remove(key);
				cb('erreur');
				log.conLogWarning('sockKey Error');
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
				//data : {'mov':movDir.pack(),'look':lookDir.pack()}
				socket.emit('reqUpdatePos', objectsUpdated, function(data){
					var jaque = gameObjectPool.get(socket.key);
					jaque.P.getVit().unpack(data.mov);
					jaque.P.getVit().setRayonTo(jaque.vitMax);
					jaque.P.orientVector.unpack(data.look);
					socket.isMaj = true;
				});
			};

			socket.emit('initGame', {'settings':gameSettings, 'pool':gameObjectPool.pack()}, function(){
				log.conLog('Game - initGame effectué: '+socket.key);
			});
			socket.broadcast.emit('newObject', {'key':key, 'data':jaque.pack()});

			// TODO : mettre ca dans le cycle d'update
			socket.on('fire', function(data,cb){
				var balle = gameObjectPool.get(socket.key).fire();
				var key = gameObjectPool.add(balle);
				if(!(key instanceof Error))
					gameIo.emit('newObject', {'key':key, 'data':balle.pack()});
			});

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