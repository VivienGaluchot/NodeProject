/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Encapsulation HTML
--------------------------------------------------- */

var encap = function(){
	this.content = '';

	this.raw = function(text){
		this.content += text;
		return this;
	};
	this.h1 = function(text){
		this.content += '<h1>'+text+'</h1>';
		return this;
	};
	this.h2 = function(text){
		this.content += '<h2>'+text+'</h2>';
		return this;
	};
	this.h3 = function(text){
		this.content += '<h3>'+text+'</h3>';
		return this;
	};
	this.a = function(url,text){
		this.content += '<a href=\"'+url+'\">'+text+'</a>';
		return this;
	};
	this.p = function(text){
		this.content += '<p>'+text+'</p>';
		return this;
	};
	this.p_ = function(text){
		this.content += '<p>'+text;
		return this;
	};
	this._p = function(text){
		this.content += text+'</p>';
		return this;
	};
	this.legend = function(text){
		this.content += '<div class="legend">'+text+'</div>';
		return this;
	};
	this.script = function(text){
		this.content += '<script>'+text+'</script>';
		return this;
	};
};

module.exports = encap;