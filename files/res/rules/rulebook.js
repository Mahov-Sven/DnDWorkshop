function Rulebook(){}

Rulebook.FUNCTIONS = {};

Rulebook.VARIABLES = {};

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

/* PARSING */
var deleteRegex = /(\/\*.*\*\/)|(\/\/.*)|[\n\r\s\t]/g;

Rulebook.prototype.parseRulebook = function(file){
	var result = file.replace(deleteRegex, '');
	var functions = [];
	while(result.length !== 0){
		var indexLastBracket = 0;
		
		var currentScope = 0;
		while(true){
			var char = result.charAt(indexLastBracket);
			if(char === 0) throw Error("The file did not have the correct ending.");
			if(char === '{'){
				currentScope++;
			}else if(char === '}'){
				currentScope--;
				if(currentScope === 0){
					indexLastBracket++;
					break;
				}
			}
			indexLastBracket++;
		}
		
		functions[functions.length] = result.substr(0, indexLastBracket);
		result = result.substr(indexLastBracket, result.length);
	}
	
	for(var i = 0; i < functions.length; i++){
		var functionParts = [];
		var functionText = functions[i];
		var charIndex = 0;
		
		var currentScope = 0;
		while(true){
			var char = functionText.charAt(charIndex);
			if(char === 0) throw Error("There was an error parsing an object's name.");
			if(char === '<' || char === '('){
				break;
			}
			charIndex++;
		}
		
		functionParts[0] = functionText.substr(0, charIndex);
		functionText = functionText.substr(charIndex, functionText.length);
		charIndex = 0;
		
		functionParts[1] = "";
		
		if(functionText.charAt(charIndex) === '<'){
			while(true){
				var char = functionText.charAt(charIndex);
				if(char === 0) throw Error("There was an error parsing an object's super classes.");
				if(char === '>'){
					break;
				}
				charIndex++;
			}
			
			functionParts[1] = functionText.substr(1, charIndex - 1);
			functionText = functionText.substr(charIndex + 1, functionText.length);
			charIndex = 0;
		}
		
		functionParts[2] = "";
		
		if(functionText.charAt(charIndex) === '('){
			while(true){
				var char = functionText.charAt(charIndex);
				if(char === 0) throw Error("There was an error parsing an object's parameters.");
				if(char === ')'){
					break;
				}
				charIndex++;
			}
			
			functionParts[2] = functionText.substr(1, charIndex - 1);
			functionText = functionText.substr(charIndex + 1, functionText.length);
			charIndex = 0;
		}
		
		functionParts[3] = [];
		
		if(functionText.charAt(0) != '{' && functionText.charAt(functionText.length - 1) != '}'){
			throw Error("The inner part of the funciton did not close/open with braces properly");
		}
		
		functionText = functionText.substr(1, functionText.length - 2);
		
		console.log(functionText);
		
		console.log(functionParts);
	}
	
	console.log(result);
}

Rulebook.prototype.ASSIGN = function(variable, assignment){
	VARIABLES[variable] = assignment();
}

Rulebook.prototype.ISEQUAL = function(param1, param2){
	return param1 == param2;
}

Rulebook.prototype.TYPEOF = function(param){
	return (typeof param);
}

Rulebook.prototype.ADD = function(numb1, numb2){
	return numb1 + numb2;
}

Rulebook.prototype.SUBTRACT = function(numb1, numb2){
	return numb1 - numb2;
}

Rulebook.prototype.FLOOR = function(numb){
	return Math.floor(numb);
}

Rulebook.prototype.CEIL = function(numb){
	return Math.ceil(numb);
}

Rulebook.prototype.IF = function(bool, ifTrue, ifFalse){
	if(bool){
		ifTrue();
	}else{
		ifFalse();
	}
}

var RULEBOOK = new Rulebook();