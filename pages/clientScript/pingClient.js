var socket = io('/pingTest');
var timer = null;
var nStorred = 30;
var lastPings = [];
var canvas;
var ctx;

window.onload = function(){
	ctx = document.getElementById("pingGraph").getContext("2d");
	canvas = document.getElementById("pingGraph");
	setHDCanvas(canvas);
	draw();
};

setHDCanvas = function(can) {
	var dpr = window.devicePixelRatio || 1;
	var bsr = ctx.webkitBackingStorePixelRatio ||
		ctx.mozBackingStorePixelRatio ||
		ctx.msBackingStorePixelRatio ||
		ctx.oBackingStorePixelRatio ||
		ctx.backingStorePixelRatio || 1;
	var ratio = dpr/bsr;
	can.width = can.offsetWidth * ratio;
	can.height = can.offsetHeight * ratio;
	can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	return can;
};

var start = function(){
	if(timer === null){
		timer = setInterval(ping, 1000);
		document.getElementById('startButton').innerHTML = 'Stop';
	}
	else {
		clearInterval(timer);
		timer = null;
		document.getElementById('startButton').innerHTML = 'Ping';
	}
};

var ping = function(){
	socket.emit('latency', Date.now(), function(startTime) {
		var latency = Date.now() - startTime;
		lastPings.push(latency);
		if(lastPings.length > nStorred)
			lastPings.shift();
		document.getElementById('pingResult').innerHTML = latency;
		draw();
	});
};

var draw = function () {
	var width = canvas.offsetWidth;
	var height = canvas.offsetHeight;
	var unitX = width / (nStorred-1);

	ctx.clearRect(0,0,width,height);	

	drawGrille(width, height, unitX);

	if(lastPings.length === 0)
		return;

	var maxValue = Math.max.apply(null, lastPings);
	if(maxValue < 1)
		maxValue = 1;

	drawCurve(width, height, unitX, maxValue);

	// info
	ctx.fillStyle = "rgb(4, 24, 38)";
	ctx.font = "12px Arial";
	var txt = maxValue+' ms';
	ctx.clearRect(3,2,ctx.measureText(txt).width + 4,16);
	ctx.fillText(txt,5,16);
};

var drawGrille = function(width, height, unitX){
	// Vertical lines
	ctx.lineWidth="1";
	for(var i=1;i<nStorred;i++){
		ctx.beginPath();
		ctx.moveTo(width-unitX*i,5);
		ctx.lineTo(width-unitX*i,height-5);
		if(i%5 === 0)
			ctx.strokeStyle="rgba(0,0,0,0.2)";
		else
			ctx.strokeStyle="rgba(0,0,0,0.05)";
		ctx.stroke();
	}
	// Horisontal lines
	ctx.strokeStyle="rgba(0,0,0,0.5)";
	ctx.beginPath();
	ctx.moveTo(0,16);
	ctx.lineTo(width,16);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0,height-10);
	ctx.lineTo(width,height-10);
	ctx.stroke();
}

var drawCurve = function(width, height, unitX, maxY){
	var x = width;
	var y = (1-lastPings[lastPings.length-1]/maxY)*(height-26)+16;
	ctx.beginPath();
	ctx.moveTo(x, y);
	for(var i=1;i<lastPings.length;i++){
		var nx = width - i*unitX;
		var ny = (1-lastPings[lastPings.length-1-i]/maxY)*(height-26)+16;
		ctx. bezierCurveTo(x-unitX/2, y, nx+unitX/2, ny, nx, ny);
		x = nx;
		y = ny;
	}
	ctx.lineWidth="2";
	ctx.strokeStyle="rgb(4, 24, 38)";
	ctx.stroke();
	ctx.lineTo(x,height-10);
	ctx.lineTo(width,height-10);
	ctx.fillStyle = "rgba(4, 24, 38,0.2)";
	ctx.fill();
}