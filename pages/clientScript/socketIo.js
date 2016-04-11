
var socket = io('http://localhost:8080');
var element = null;
var pseudo = null;

window.onload = function(){
	element = document.getElementById('chatArea');
	pseudo = prompt('Entrez votre pseudo');
	socket.emit('chatNew', pseudo);
}

socket.on('chatNew', function(pseudo) {
	display('<b>'+pseudo+'</b> a rejoint le Chat');
});
socket.on('chatMessage', function(data) {
	display('<b>'+data.pseudo+'</b> : '+data.message);
});
socket.on('chatDisconnect', function(pseudo) {
	display('<b>'+pseudo+'</b> a quitté le Chat');
});

var envoyerMessage = function(){
	var message = messageField.value;
	messageField.value = '';
	socket.emit('chatMessage', message);
};

var display = function(text){
	element.innerHTML += '<div class="cadreTextLine">'+text+'</div>';
	element.scrollTop = element.scrollHeight;
}

var touche = function(event){
	if(event.keyCode === 13)
		envoyerMessage();
}