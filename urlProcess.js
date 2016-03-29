/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Répartition des URL
--------------------------------------------------- */

var index = require('./pages/index');
var error404 =require('./pages/error404');

module.exports = {
	process : function(request, response, url){
		if(url == null || url.length == 0 || url == '/' || url == '/index'){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(index.out());
		}
		else{
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.write(error404.out());
		}
		response.end();
	}
};