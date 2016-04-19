var canvasObj = function(id){
	var self = this;

	this.id = id;

	self.element = null;
	self.ctx = null;

	self.width = 0;
	self.height = 0;

	this.draw = function(){
		self.ctx.clearRect(0,0,self.width,self.height);
	}

	// Retina fix
	this.resize = function(){
		var dpr = window.devicePixelRatio || 1;
		var bsr = self.ctx.webkitBackingStorePixelRatio ||
			self.ctx.mozBackingStorePixelRatio ||
			self.ctx.msBackingStorePixelRatio ||
			self.ctx.oBackingStorePixelRatio ||
			self.ctx.backingStorePixelRatio || 1;
		var ratio = dpr/bsr;
		self.element.width = self.element.offsetWidth * ratio;
		self.element.height = self.element.offsetHeight * ratio;
		self.element.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	// ---- Loading ---- //
	this.load = function(){
		self.element = document.getElementById(self.id);

		self.width = self.element.offsetWidth;
		self.height = self.element.offsetHeight;

		self.ctx = self.element.getContext("2d");

		self.resize();
	}
}