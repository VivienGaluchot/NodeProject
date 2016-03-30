/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Modele de page
--------------------------------------------------- */

module.exports = {
	title: 'Titre de page',
	content: 'Page',

	out: function(url){
		var response = '<html><head>';		
		response += '<meta charset=UTF-8>';
		response += '<title>' + this.title.toString(url) + '</title>';
		response += '<link rel="stylesheet" type="text/css" href="style.css">';
		response += '</head><body>' + this.content.toString(url) + '</body>';
		response += '</html>';
		return response;
	}
};