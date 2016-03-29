/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Modele de page
--------------------------------------------------- */

module.exports = {
	title: 'Titre de page',

	content: function(){
		return 'Page';
	},

	out: function(){
		var response = '<html>';
		response += '<head><title>' + this.title + '</title></head>';
		response += '<body>' + this.content() + '</body>';
		response += '</html>';
		return response;
	}
};