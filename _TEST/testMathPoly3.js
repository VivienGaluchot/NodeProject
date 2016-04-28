var logCalc = function(txt){
	calcResult.innerHTML += '<div>'+txt+'</div>';
}

// Calcule a,b,c tels que
//
// a = A1*c + A2
// b = B1*c + B2
// c = C1*a + C2*b + C3
//
// return {'a':a, 'b':b, 'c':c}
var computeabc = function(A1,A2,B1,B2,C1,C2,C3){
	var a = 0;
	var b = 0;
	var c = 0;

	c = (A2*C1 + B2*C2 + C3) / (1 - A1*C1 - B1*C2);
	a = A1 * c + A2;
	b = B1 * c + B2;

	var result = {'a':a, 'b':b, 'c':c};
	
	// TEST
	var valid = true;
	var t = Math.abs((A1*c + A2)-a);
	if(t > 1e-6){
		logCalc('a invalid : '+t);
		valid = false;
	}
	t = Math.abs((B1*c + B2)-b);
	if(t > 1e-6){
		logCalc('b invalid : '+t);
		valid = false;
	}
	t = Math.abs((C1*a + C2*b + C3) - c);
	if(t > 1e-6){
		logCalc(A1+','+A2+','+B1+','+B2+','+C1+','+C2+','+C3);
		logCalc('c invalid : '+t);
		valid = false;
	}
	return valid;
}

logCalc('test 1 : '+computeabc(1,1,2,2,3,3,3));
logCalc('test 2 : '+computeabc(0,10,2,-10,34,31.57,3));

/*var fails = 0;
for(var i=0;i<1000;i++){
	if(!computeabc(
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000,
			Math.random() * 10000 - 5000)
		)
		fails++;
}

logCalc('1000 test : '+fails+' fails');*/

// ---- Plot ---- //

var canvasPlot = new canvasObj('plot');
canvasPlot.load();

// f : fonction
// i : minX, h :maxX
// p : pax
// k : minY, l : maxY
var plotFunc = function(f,i,j,p,k,l){
	if(i>=j || p<=0)
		return;
	var values = [];
	var min = f(i);
	var max = f(i);
	for(var x=i;x<j;x += p){
		var calc = f(x);
		values.push({'x':x, 'y':calc});
		if(calc<min)
			min = calc;
		else if(calc>max)
			max = calc;
	}
	var calc = f(j);
	values.push({'x':j, 'y':calc});
	if(calc<min)
		min = calc;
	else if(calc>max)
		max = calc;

	if(k !== undefined && l !== undefined){
		min = k;
		max = l;
	}

	var ctx = canvasPlot.ctx;

	// i-j -> 0-width
	// min-max -> height-0
	var M = [
				[canvasPlot.width/(j-i)		,0									,canvasPlot.width*(-i)/(j-i)		],
				[0							,(-1*canvasPlot.height)/(max-min)	,canvasPlot.height*(max)/(max-min)	],
				[0							,0									,1									]
			];

	var transform = function(x,y){
		var vec = multiplyMatrices(M, [[x],[y],[1]]);
		var p = {'x':vec[0][0],'y':vec[1][0]};
		return p;
	};

	var drawLine = function(x1,y1,x2,y2){
		var p;
		ctx.beginPath();
		p = transform(x1,y1);
		ctx.moveTo(p.x,p.y);
		p = transform(x2,y2);
		ctx.lineTo(p.x,p.y);
		ctx.stroke();
	};

	ctx.save();
	ctx.strokeStyle="grey";	
	ctx.lineWidth=1;
	drawLine(0,min,0,max);
	drawLine(i,0,j,0);
	ctx.lineWidth=2;
	ctx.strokeStyle="black";
	drawLine(0,0,0,1);
	drawLine(0,0,1,0);

	

	for(var x=0;x<values.length-1;x++){
		// Courbe
		ctx.lineWidth=2;
		ctx.strokeStyle="red";
		drawLine(values[x].x,values[x].y,values[x+1].x,values[x+1].y);
		// Points
		ctx.lineWidth=1;
		ctx.strokeStyle="blue";		
		var p = transform(values[x].x,values[x].y);
		ctx.beginPath();
		ctx.moveTo(p.x,p.y-3);
		ctx.lineTo(p.x,p.y+3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(p.x-3,p.y);
		ctx.lineTo(p.x+3,p.y);
		ctx.stroke();
	}

	ctx.restore();
}

canvasPlot.clear();
plotFunc(function(x){return x*x*x},-2,2,0.1,-2,2);

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
}