var socket = null;
var element = null;
var pseudo = null;

window.onload = function(){
	// ---- SOCKET ---- //
	socket = io('/chat');

	socket.on('connect',function(){		
		display('<i>Connecté au serveur</i>');
		if(pseudo === null)
			setPseudo('Entrez votre pseudo');
		else
			socket.emit('chatNew', pseudo);
	});

	socket.on('pseudoPris', function(){
		setPseudo('Ce pseudo est déja pris');
	});

	socket.on('pseudoVide', function(){
		setPseudo('Entrez un pseudo non vide');
	});

	socket.on('chatNew', function(data) {
		updateNbUser(data.nbUser);
		display(data.timeStamp + ' - <b>'+data.pseudo+'</b> a rejoint le Chat');
	});

	socket.on('chatMessage', function(data) {
		display(data.timeStamp + ' - <b>'+data.pseudo+'</b> : '+data.message);
	});

	socket.on('chatDisconnect', function(data) {	
		updateNbUser(data.nbUser);
		display(data.timeStamp + ' - <b>'+data.pseudo+'</b> a quitté le Chat');
	});

	socket.on('disconnect',function(){
		display('<i>Perte de la connexion</i>');
	});

	element = document.getElementById('chatArea');
};

var setPseudo = function(str){
	var elementPseudo = document.getElementById('pseudoIHM');
	pseudo = prompt(str);
	elementPseudo.innerHTML = pseudo;
	socket.emit('chatNew', pseudo);
};

var updateNbUser = function(n){
	var elementNbUser = document.getElementById('nbUserIHM');
	if(n<2)
		elementNbUser.innerHTML = n + ' utilisateur';
	else
		elementNbUser.innerHTML = n + ' utilisateurs';
};

var envoyerMessage = function(){
	var message = messageField.value;
	messageField.value = '';
	socket.emit('chatMessage', message);
};

var display = function(text){
	element.innerHTML += '<div class="cadreTextLine">'+text+'</div>';
	element.scrollTop = element.scrollHeight;
};

var touche = function(event){
	if(event.keyCode === 13)
		envoyerMessage();
};
