var canvasObj = function(id){
	this.id = id;

	this.element = null;
	this.ctx = null;

	this.width = 0;
	this.height = 0;

	this.draw = function(){
		this.ctx.clearRect(0,0,this.width,this.height);
	};

	this.startDraw = function(){
		window.requestAnimationFrame(this.draw);
	};

	// Retina fix
	this.resize = function(){
		var dpr = window.devicePixelRatio || 1;
		var bsr = this.ctx.webkitBackingStorePixelRatio ||
			this.ctx.mozBackingStorePixelRatio ||
			this.ctx.msBackingStorePixelRatio ||
			this.ctx.oBackingStorePixelRatio ||
			this.ctx.backingStorePixelRatio || 1;
		var ratio = dpr/bsr;
		this.element.width = this.element.offsetWidth * ratio;
		this.element.height = this.element.offsetHeight * ratio;
		this.element.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

		this.width = this.element.width;
		this.height = this.element.height;
	};

	// ---- Loading ---- //
	this.load = function(){
		this.element = document.getElementById(this.id);

		this.ctx = this.element.getContext("2d");

		this.resize();
	};
};