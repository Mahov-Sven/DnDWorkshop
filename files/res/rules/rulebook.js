function Rulebook(){}

Rulebook.FUNCTIONS = {};

Rulebook.prototype.FUNCTIONS_ADD = function(){
	// TODO
}

Rulebook.prototype.BIND_ELEMENT = function(elem, valueName){
	this.elem = elem;
	this.valueName = valueName;
	this.value = function(){return RULEBOOK.FUNCTIONS[this.valueName];};
	elem.value  = this.value;
	elem.addEventListener("change", this, false);
}

Rulebook.prototype.BIND_ELEMENT.prototype.handleEvent = function(evt){
	switch(evt.type){
		case "onValueChange": this.onValueChange(this.elem.value);
	}
}

Rulebook.prototype.BIND_ELEMENT.prototype.onValueChange = function(value){
	RULEBOOK.FUNCTIONS[this.valueName].setValue(value);
	this.elem.value = value;
}

Rulebook.prototype.ADD = function(numb1, numb2){
	if(!(typeof numb1 === "number" && typeof numb2 === "number")){
		throw TypeError("'numb1' and 'numb2' in Rulebook.ADD(numb1, numb2) must be of type 'number'.");
	}
	
	return numb1 + numb2;
}

Rulebook.prototype.SUBTRACT = function(numb1, numb2){
	if(!(typeof numb1 === "number" && typeof numb2 === "number")){
		throw TypeError("'numb1' and 'numb2' in Rulebook.SUBTRACT(numb1, numb2) must be of type 'number'.");
	}
	
	return numb1 - numb2;
}

Rulebook.prototype.INT = function(numb){
	if(!(typeof numb === "number")){
		throw TypeError("'var1' in Rulebook.INT(numb) must be of type 'number'.");
	}
	
	return Math.floor(numb);
}

Rulebook.prototype.UINT = function(numb){
	if(!(typeof numb === "number")){
		throw TypeError("'var1' in Rulebook.INT(numb) must be of type 'number'.");
	}
	
	return Math.ceil(numb);
}

var RULEBOOK = new Rulebook();