var Bonhomme = function(){
	this.nom = null;
	this.type = 'Bonhomme';
	this.score = 0;
	
	// point
	var P = new animOrientedPoint();
	this.P = P;

	P.orientVectorSize = 20;
	this.setSize = function(size){
		this.size = size;
		P.animPoint.size = size;
	};

	// mouse tracking
	this.lookTo = function(x,y){
		P.orientToThePoint(x,y);
	};

	this.stepAnim = function(t){
		P.stepAnim(t);

		if(this===yourBonhomme){
			yourBonhomme.lookTo(mouseX,mouseY);
			lookDir.setFromVect(yourBonhomme.P.orientVector);
		}
	};

	this.drawOn = function(ctx){
		P.drawOn(ctx);

		ctx.font = '12px Arial';
		if(P.getPos().y<this.size/2+16)
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y+this.size/2+15);
		else
			ctx.fillText(this.nom,P.getPos().x - (ctx.measureText(this.nom).width/2),P.getPos().y-this.size/2-4);
	};

	this.pack = function(){
		return {'type':'Bonhomme','nom':this.nom,'data':this.P.pack(),'size':this.size,'score':this.score};
	};

	this.unpack = function(obj){
		if(obj.nom !== undefined)
			this.nom = obj.nom;
		if(obj.data !== undefined)
			this.P.unpack(obj.data);
		if(obj.size !== undefined)
			this.setSize(obj.size);
		if(obj.score !== undefined)
			this.score = obj.score;
	};


	this.packP = function(){
		return this.P.pack();
	};

	this.unpackP = function(obj){
		this.P.unpack(obj);
	};
};


var Balle = function(){
	this.vitMax = 1;
	this.size = 6;
	this.type = 'Balle';

	// point
	var P = new animPoint();
	this.P = P;
	/// affichage de la trace
	this.trainee = new Vector2D();

	this.drawOn = function(ctx){		
		ctx.lineWidth = 3;
		ctx.strokeStyle='rgb(255,50,0)';
		// ligne
		ctx.beginPath();
		ctx.moveTo(P.getPos().x,P.getPos().y);
		ctx.lineTo(P.getPos().x+this.trainee.x,P.getPos().y+this.trainee.y);
		ctx.stroke();
	};

	this.stepAnim = function(t){ // t en ms
		this.trainee.x = -P.getVit().x;
		this.trainee.y = -P.getVit().y;
		this.trainee.setRayonTo(this.size);

		P.stepAnim(t);
	};

	this.pack = function(){
		return {'type':'Balle','data':this.P.pack()};
	};

	this.unpack = function(obj){
		this.P.unpack(obj.data);
	};

	this.packP = function(){		
		return this.P.pack();
	};

	this.unpackP = function(obj){
		this.P.unpack(obj);
	};
};