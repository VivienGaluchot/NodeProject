/* ---------------------------------------------------
	By Pellgrain - 12/04/2016

	Gestion des sockets de socket.io
--------------------------------------------------- */

const log = require('./log');
const ent = require('ent');

const chatSocket = require('./sockets/chatSocket.js');
const gameSocket = require('./sockets/gameSocket.js');

log.conLog('Chargement de socketProcess');

module.exports = function (io) {
	// ---- CHAT ---- //
	var chatIo = io.of('/chat');
	chatSocket.process(chatIo,io);

	// ---- GAME ---- //
	var gameIo = io.of('/game');
	gameSocket.process(gameIo,io);

	// ---- PING ---- //
	var ping = io.of('/ping');
	ping.on('connection', function (socket) {
		socket.on('latency', function (startTime, cb) {
			cb(startTime);
		}); 
	});
};