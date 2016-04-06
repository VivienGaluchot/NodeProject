/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Module de Log
--------------------------------------------------- */

var lastDate = new Date();
var strDate = function(){
	var date = new Date();
	if(date.getHours()==lastDate.getHours() && date.getMinutes()==lastDate.getMinutes() && date.getSeconds()==lastDate.getSeconds())
		return '';
	else{
		lastDate = date;
		return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() + '\n    ';
	}
}

module.exports = {
	conLog : function(out){
		var date = new Date();
		console.log('LOG ' + strDate() + ' . ' + out);
	},

	conLogWarning : function(out){
		var date = new Date();
		console.log('WARNING ' + strDate() + ' -> ' + out);
	},

	conLogError : function(out){
		var date = new Date();
		console.log('ERROR ' + strDate() + ' -> ' + out);
	},

	conLogSuite : function(out){
		console.log('     . ' + out);
	}
};