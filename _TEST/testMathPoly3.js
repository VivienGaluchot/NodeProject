var logCalc = function(txt){
	calcResult.innerHTML += '<div>'+txt+'</div>';
}

var plotFunc = function(f,i,j,p){
	if(i>=j || p>=0)
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

var fails = 0;
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

logCalc('1000 test : '+fails+' fails');