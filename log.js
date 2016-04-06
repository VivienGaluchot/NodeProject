/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Module de Log
--------------------------------------------------- */

var lastDate = new Date(0);

var strDate = function(){
	var date = new Date();
	if(date.getSeconds()==lastDate.getSeconds() && date.getMinutes()==lastDate.getMinutes() && date.getHours()==lastDate.getHours() && date.getDate()==lastDate.getDate())
		return '';
	else{
		lastDate = date;
		return ' --- '+date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear()+' - '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+' --- \n';
	}
}

module.exports = {
	conLog : function(out){
		var date = new Date();
		console.log(strDate() + 'LOG. ' + out);
	},

	conLogWarning : function(out){
		var date = new Date();
		console.log(strDate() + 'WRN. ' + out);
	},

	conLogError : function(out){
		var date = new Date();
		console.log(strDate() + 'ERR. ' + out);
	},

	conLogSuite : function(out){
		console.log('     ' + out);
	}
};