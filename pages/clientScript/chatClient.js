var socket = io();
var element = null;
var pseudo = null;

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

socket.on('pseudoPris', function(){
	setPseudo('Ce pseudo est déja pris');
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

window.onload = function(){
	element = document.getElementById('chatArea');
	setPseudo('Entrez votre pseudo');
};
