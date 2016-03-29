/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Module de Log
--------------------------------------------------- */

module.exports = {
	conLog : function(out){
		console.log('LOG -- ' + out);
	},

	conLogWarning : function(out){
		console.log('WARNING -- ' + out);
	},

	conLogError : function(out){
		console.log('ERROR -- ' + out);
	}
};