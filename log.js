/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Module de Log
--------------------------------------------------- */


module.exports = {
	conLog : function(out){
		var date = new Date();
		console.log('LOG ' + date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() + ' . ' + out);
	},

	conLogWarning : function(out){
		var date = new Date();
		console.log('WARNING ' + date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() + ' -> ' + out);
	},

	conLogError : function(out){
		var date = new Date();
		console.log('ERROR ' + date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() + ' -> ' + out);
	},

	conLogSuite : function(out){
		console.log('             . ' + out);
	}
};