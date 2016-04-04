/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Encapsulation HTML
--------------------------------------------------- */

module.exports = {
	get: function(balise, text){
		return '<'+balise+'>'+text+'</'+balise+'>';
	},
	getWithArg: function(balise, arguments, text){
		return '<'+balise+' '+arguments+'>'+text+'</'+balise+'>';
	},
	h1: function(text){
		return '<h1>'+text+'</h1>';
	},
	h2: function(text){
		return '<h2>'+text+'</h2>';
	},
	h3: function(text){
		return '<h3>'+text+'</h3>';
	},
	a: function(url,text){
		return '<a href=\"'+url+'\"">'+text+'</a>';
	},
	p: function(text){
		return '<p>'+text+'</p>';
	},
	legend: function(text){
		return '<div class="legend">'+text+'</div>';
	}
};