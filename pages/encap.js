/* ---------------------------------------------------
	By Pellgrain - 29/03/2016

	Encapsulation HTML
--------------------------------------------------- */

module.exports = {
	content: '',
	raw: function(text){
		this.content += text;
		return this;
	},
	h1: function(text){
		this.content += '<h1>'+text+'</h1>';
		return this;
	},
	h2: function(text){
		this.content += '<h2>'+text+'</h2>';
		return this;
	},
	h3: function(text){
		this.content += '<h3>'+text+'</h3>';
		return this;
	},
	a: function(url,text){
		this.content += '<a href=\"'+url+'\">'+text+'</a>';
		return this;
	},
	p: function(text){
		this.content += '<p>'+text+'</p>';
		return this;
	},
	p_: function(text){
		this.content += '<p>'+text;
		return this;
	},
	_p: function(text){
		this.content += text+'</p>';
		return this;
	},
	legend: function(text){
		this.content += '<div class="legend">'+text+'</div>'
		return this;;
	},
	script: function(text){
		this.content += '<script>'+text+'</script>';
		return this;
	}
};