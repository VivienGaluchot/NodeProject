function getXMLHttpRequest() {
	var xhr = null;
	
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	
	return xhr;
}

var xhr = getXMLHttpRequest();
var datePing;
var timer;

var send = function(){
	xhr.open('POST', 'ajax/test', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('A=1&B=2');
	datePing = new Date();
}

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0))
		readData(xhr.responseText);
}

var readData = function(data) {
	var t = new Date().getTime() - datePing.getTime();
	ajaxResult.innerHTML = data+' - ping : '+t+'ms';
	timer = setTimeout(send, 1000);
}
