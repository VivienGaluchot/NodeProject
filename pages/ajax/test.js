/* ---------------------------------------------------
	By Pellgrain - 29/03/201

	Réponse ajax de test
--------------------------------------------------- */

module.exports = {
	out: function(request){
		var date = new Date();
		return date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
	}
};