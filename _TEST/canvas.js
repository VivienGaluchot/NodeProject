var canvasObj = function(id){
	this.id = id;

	this.element = null;
	this.ctx = null;

	this.width = 0;
	this.height = 0;

	this.draw = function(){
		this.ctx.clearRect(0,0,this.width,this.height);
	};

	this.clear = function(){
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


	// ---- Transformation ---- //

	this.transfMatrix = [	[1	,0	,0	],
							[0	,1	,0	],
							[0	,0	,1	]];

	this.setRectBounds = function(Xmin,Xmax,Ymin,Ymax){
		this.transfMatrix = [	[this.width/(Xmax-Xmin)	,0								,this.width*(-Xmin)/(Xmax-Xmin)	],
								[0						,(-1*this.height)/(Ymax-Ymin)	,this.height*(Ymax)/(Ymax-Ymin)	],
								[0						,0								,1								]];
	};

	this.transformPoint = function(x,y){
		var vec = multiplyMatrices(this.transfMatrix, [[x],[y],[1]]);
		var p = {'x':vec[0][0],'y':vec[1][0]};
		return p;
	};

	this.drawTransfLine = function(x1,y1,x2,y2){
		this.ctx.beginPath();
		var p = this.transformPoint(x1,y1);
		this.ctx.moveTo(p.x,p.y);
		p = this.transformPoint(x2,y2);
		this.ctx.lineTo(p.x,p.y);
		this.ctx.stroke();
	}.bind(this);
};


// ---- PlotCanvas ---- //

var plotInit = function(canvasObj,Xmin,Xmax,Ymin,Ymax){

	canvasObj.setRectBounds(Xmin,Xmax,Ymin,Ymax);

	var drawLine = canvasObj.drawTransfLine;

	this.ptDisplay = false;
	this.ptColor = null;

	this.clear = function(){
		canvasObj.clear();
		canvasObj.ctx.strokeStyle="grey";
		canvasObj.ctx.lineWidth=1;
		drawLine(0,Xmin,0,Xmax);
		drawLine(Xmin,0,Xmax,0);
		canvasObj.ctx.lineWidth=2;
		canvasObj.ctx.strokeStyle="black";
		drawLine(0,0,0,1);
		drawLine(0,0,1,0);
	};

	this.clear();

	this.setPtDisplay = function(value,ptColor){
		this.ptDisplay = value;
		this.ptColor = ptColor;
	};

	this.plotTraj = function(f,Xmin,Xmax,pas,name,color){
		var values = [];
		for(var t=Xmin; t<Xmax; t+=pas){
			var calc = f(t);
			values.push([calc.x, calc.y]);
		}
		var calc = f(Xmax);
		values.push([calc.x, calc.y]);

		for(var t=0; t<values.length-1; t++){
			// Courbe
			canvasObj.ctx.lineWidth=2;
			canvasObj.ctx.strokeStyle=color;
			drawLine(values[t][0],values[t][1],values[t+1][0],values[t+1][1]);

			// Points
			if(this.ptDisplay){
				// Style
				canvasObj.ctx.lineWidth = 1;
				canvasObj.ctx.strokeStyle = this.ptColor;

				var p = canvasObj.transformPoint(values[t][0],values[t][1]);

				canvasObj.ctx.beginPath();
				canvasObj.ctx.moveTo(p.x,p.y-3);
				canvasObj.ctx.lineTo(p.x,p.y+3);
				canvasObj.ctx.stroke();
				canvasObj.ctx.beginPath();
				canvasObj.ctx.moveTo(p.x-3,p.y);
				canvasObj.ctx.lineTo(p.x+3,p.y);
				canvasObj.ctx.stroke();
			}
		}
	};

	this.plotFunc = function(f,Xmin,Xmax,pas,name,color){
		var trajF = function(t){
			return {'x': t,'y': f(t)};
		};
		this.plotTraj(trajF,Xmin,Xmax,pas,name,color);
	};
};


// ---- Tools ---- //

function multiplyMatrices(m1, m2) {
	var result = [];
	for (var i = 0; i < m1.length; i++) {
		result[i] = [];
		for (var j = 0; j < m2[0].length; j++) {
			var sum = 0;
			for (var k = 0; k < m1[0].length; k++) {
				sum += m1[i][k] * m2[k][j];
			}
			result[i][j] = sum;
		}
	}
	return result;
};
