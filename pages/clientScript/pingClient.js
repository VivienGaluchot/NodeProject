var socket = io('/pingTest');
var timer = null;
var nStorred = 30;
var lastPings = [];

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
}

var ping = function(){
	socket.emit('latency', Date.now(), function(startTime) {
	    var latency = Date.now() - startTime;
	    lastPings.push(latency);
	    if(lastPings.length > nStorred)
	    	lastPings.shift();
	    document.getElementById('pingResult').innerHTML = latency;
	    draw();
	});
}

function draw() {
	var canvas = document.getElementById("pingGraph");
	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;

	ctx.clearRect(0,0,width,height);

	var maxValue = Math.max.apply(null, lastPings);
	if(maxValue === 0) return;
	var unitTime = width / (nStorred-1);

	// background lines
	ctx.lineWidth="1";
	for(var i=1;i<nStorred;i++){
		ctx.beginPath();
		ctx.moveTo(width-unitTime*i,3);
		ctx.lineTo(width-unitTime*i,height-3);
		if(i%5 === 0)
			ctx.strokeStyle="rgba(0,0,0,0.2)";
		else
			ctx.strokeStyle="rgba(0,0,0,0.05)";
		ctx.stroke();
	}

	// graph
	ctx.beginPath();
	var x = width;
	var y = (1-lastPings[lastPings.length-1]/maxValue)*(height-20)+17;
	ctx.moveTo(x, y);
	for(var i=1;i<lastPings.length;i++){
		var nx = width - i*unitTime;
		var ny = (1-lastPings[lastPings.length-1-i]/maxValue)*(height-20)+17;
		ctx. bezierCurveTo(x-unitTime/2, y, nx+unitTime/2, ny, nx, ny);
		x = nx;
		y = ny;
	}
	ctx.lineWidth="2";
	ctx.strokeStyle="rgb(4, 24, 38)";
	ctx.stroke();
	ctx.lineTo(x,height);
	ctx.lineTo(width,height);
	ctx.fillStyle = "rgba(4, 24, 38,0.2)";
	ctx.fill();

	// info
	ctx.fillStyle = "rgb(4, 24, 38)";
	ctx.font = "12px Arial";
	ctx.fillText('Ping max sur '+nStorred+' s : '+maxValue+' ms',5,15);
}

