var logCalc = function(txt){
	calcResult.innerHTML += '<div>'+txt+'</div>';
};

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

	c = (A2*C1 + B2*C2 + C3)/(1 - A1*C1 - B1*C2);
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

	if(valid)
		return result;
	else
		return 'invalid';
};

if(computeabc(1,1,2,2,3,3,3) !== 'invalid')
	logCalc('test 1 : valide');
else
	logCalc('test 1 : invalide');
if(computeabc(0,10,2,-10,34,31.57,3) !== 'invalid')
	logCalc('test 2 : valide');
else
	logCalc('test 2 : invalide');
// Calcule les coef a,b,c du polynome P de degre 3, tels que
//
//P(x) = ax^3 + bx^2 + bx +c
//P(To) = Xo, P(Tf) = Xf
//P'(To) = Vo, P'(Tf) = Vf
var computePoly3 = function(To,Tf,Xo,Xf,Vo,Vf){
	var a1 = 1/(3*Tf*To);
	var a2 = -Vo/(3*Tf*To) + (Vf-Vo)/(3*(Tf-To)*Tf);
	var b1 = -(Tf+To)/(2*Tf*To);
	var b2 = (1-(Tf+To)/Tf) * (Vf-Vo)/(2*(Tf-To)) + Vo * (Tf+To)/(2*Tf*To);
	var c1 = ((To*To*To) - (Tf*Tf*Tf))/(Tf-To);
	var c2 = (To*To-Tf*Tf)/(Tf-To);
	var c3 = (Xf-Xo)/(Tf-To);

	var param = computeabc(a1,a2,b1,b2,c1,c2,c3);
	param.d = Xo - param.a*To*To*To - param.b*To*To - param.c*To;

	return param;
};

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
var plotInit = function(i,j,k,l){
	this.i = i;
	this.j = j;
	this.k = k;
	this.l = l;

	var min = k;
	var max = l;
	// i-j -> 0-width
	// min-max -> height-0
	this.M = [
				[canvasPlot.width/(j-i)		,0									,canvasPlot.width*(-i)/(j-i)		],
				[0							,(-1*canvasPlot.height)/(max-min)	,canvasPlot.height*(max)/(max-min)	],
				[0							,0									,1									]
			];
	var M = this.M;

	this.transform = function(x,y){
		var vec = multiplyMatrices(M, [[x],[y],[1]]);
		var p = {'x':vec[0][0],'y':vec[1][0]};
		return p;
	};
	var transform = this.transform;

	this.drawLine = function(x1,y1,x2,y2){
		var p;
		ctx.beginPath();
		p = transform(x1,y1);
		ctx.moveTo(p.x,p.y);
		p = transform(x2,y2);
		ctx.lineTo(p.x,p.y);
		ctx.stroke();
	};
	var drawLine = this.drawLine;

	var ctx = canvasPlot.ctx;
	ctx.strokeStyle="grey";	
	ctx.lineWidth=1;
	drawLine(0,min,0,max);
	drawLine(i,0,j,0);
	ctx.lineWidth=2;
	ctx.strokeStyle="black";
	drawLine(0,0,0,1);
	drawLine(0,0,1,0);
};

var plotFunc = function(f,p,color,pt){
	i = this.i;
	j = this.j;
	k = this.k;
	l = this.l;
	var values = [];
	for(var x=i;x<j;x += p){
		var calc = f(x);
		values.push({'x':x, 'y':calc});
	}
	var calc = f(j);
	values.push({'x':j, 'y':calc});

	var ctx = canvasPlot.ctx;

	for(var x=0;x<values.length-1;x++){
		// Courbe
		ctx.lineWidth=2;
		ctx.strokeStyle=color;
		this.drawLine(values[x].x,values[x].y,values[x+1].x,values[x+1].y);
		// Points
		if(pt){
			ctx.lineWidth=1;
			ctx.strokeStyle='black';
			var p = this.transform(values[x].x,values[x].y);
			ctx.beginPath();
			ctx.moveTo(p.x,p.y-3);
			ctx.lineTo(p.x,p.y+3);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(p.x-3,p.y);
			ctx.lineTo(p.x+3,p.y);
			ctx.stroke();		
		}
	}
};

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

var To = -1;
var Tf = 1;
var Xo = -1;
var Xf = 1;
var Vo = 2;
var Vf = -1;

var param = computePoly3(To,Tf,Xo,Xf,Vo,Vf);
var poly3 = function(x){
	return x*x*x*param.a + x*x*param.b + x*param.c + param.d;
};
var polyD3 = function(x){
	return x*x*param.a*3 + x*param.b*2 + param.c;
};
logCalc('---------------------------------------------');
logCalc('Données');
logCalc('To = '+To+', Tf = '+Tf+', Xo = '+Xo+', Xf = '+Xf+', Vo = '+Vo+', Vf = '+Vf);
logCalc('---------------------------------------------');
logCalc('Valeurs calculées');
logCalc('param : '+param.a+', '+param.b+', '+param.c);
logCalc('Xo = poly(To) = '+poly3(To)+' | '+'Xf = poly(Tf) = '+poly3(Tf));
logCalc('Vo = polyD(To) = '+polyD3(To)+' | '+'Vf = polyD(Tf) = '+polyD3(Tf));

canvasPlot.clear();
plotInit(-5,5,-5,5);
plotFunc(poly3,0.05,'green',false);
plotFunc(polyD3,0.05,'red',false);


logCalc('Courbe verte : poly3, courbe rouge : polyD3');