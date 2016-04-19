/* ---------------------------------------------------
	By Pellgrain - 05/04/2016

	Page de chat
--------------------------------------------------- */


var encap = require('./util/encap');

// Hérite de l'objet page
var page = require('./util/page');
var p = new page();

// Code spécifique
p.scriptFileList.push('/socket.io/socket.io.js');
p.scriptFileList.push('/clientScript/chatClient.js');

// Nav
p.url = '/chat';
p.navName = 'Chat';
p.addToNav();

p.title = 'Chat';

p.header = { toString: function(){
	var response = new encap().
	h1('Chater avec des gens');
	return response.content;
}};

p.section = { toString: function(){
	var response = new encap().
	h2('Raconte des trucs !').
	p('Ceci est un chat en direct avec des gens. Attention, aucune vérification n\'est faite sur l\'authenticité des utilisateurs.').
	p('Ton pseudo : <b><span id="pseudoIHM"></span></b>.').
	p('<span id="nbUserIHM"></span> connecté.').
	raw('<div id="chatArea" class="cadreText"></div>').
	raw('<input type="text" id="messageField" class="textInput" onkeypress="touche(event)"></input>');
	return response.content;
}};

module.exports.out = function(){return p.out();};
module.exports.url = p.url;