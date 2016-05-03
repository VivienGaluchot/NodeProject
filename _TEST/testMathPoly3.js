var logCalc = function(txt){
	calcResult.innerHTML += '<div>'+txt+'</div>';
};

var computeTraj = function(To,Tf,Po,Pf,Vo,Vf){
	var T = Tf - To;

	var A = {'x':0, 'y':0};
	var B = {'x':0, 'y':0};
	var C = {'x':0, 'y':0};
	var D = {'x':0, 'y':0};

	D.x = Po.x;
	C.x = Vo.x;
	B.x = ( 3*(Pf.x - Po.x)/T - (Vf.x + 2*Vo.x) )/T;
	A.x = (Vf.x - Vo.x - 2*B.x*T) / (3*T*T);

	D.y = Po.y;
	C.y = Vo.y;
	B.y = ( 3*(Pf.y - Po.y)/T - (Vf.y + 2*Vo.y) )/T;
	A.y = (Vf.y - Vo.y - 2*B.y*T) / (3*T*T);

	var pos = function(time){
		var t = time-To;
		this.t3 = t*t*t;
		this.t2 = t*t;

		this.A = {'x':A.x, 'y':A.y};
		this.B = {'x':B.x, 'y':B.y};
		this.C = {'x':C.x, 'y':C.y};
		this.D = {'x':D.x, 'y':D.y};

		var P = {'x':0, 'y':0};
		P.x = this.A.x*t3 + this.B.x*t2+ this.C.x*t + this.D.x;
		P.y = this.A.y*t3 + this.B.y*t2+ this.C.y*t + this.D.y;
		return P;
	};

	var vit = function(time){
		var t = time-To;
		this.t2 = t*t;

		this.A = {'x':A.x, 'y':A.y};
		this.B = {'x':B.x, 'y':B.y};
		this.C = {'x':C.x, 'y':C.y};

		var V = {'x':0, 'y':0};
		V.x = this.A.x*t2*3 + this.B.x*t*2+ this.C.x;
		V.y = this.A.y*t2*3 + this.B.y*t*2+ this.C.y;
		return V;
	}

	return {'pos':pos ,'vit':vit};
};


// ---- Plot Init ---- //

var canvasPlot = new canvasObj('plot');
canvasPlot.load();
canvasPlot.clear();

var plot = new plotInit(canvasPlot,-5,5,-5,5);
plot.setPtDisplay(true,'black');

// ---- Test ---- //

var To = -5;
var Tf = 3;
var Po = new Vector2D(-3,-4);
var Pf = new Vector2D(1,2);
var Vo = new Vector2D(1,0);
var Vf = new Vector2D(2,-2);

var X = computeTraj(To,Tf,Po,Pf,Vo,Vf);
var pos = X.pos;
var vit = X.vit;

logCalc('Test de validitée :');

var isEqual = function(A,B){
	return A.x === B.x && A.y === B.y;
};

logCalc('pos(To) === Po ? ' + isEqual(pos(To),Po));
logCalc('pos(Tf) === Pf ? ' + isEqual(pos(Tf),Pf));
logCalc('vit(To) === Vo ? ' + isEqual(vit(To),Vo));
logCalc('vit(Tf) === Vf ? ' + isEqual(vit(Tf),Vf));

plot.plotTraj(pos,To,Tf,0.1,'TrajTest','blue');