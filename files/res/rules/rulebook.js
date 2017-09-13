/* PARSING */
var deleteRegex = /(\/\*.*\*\/)|(\/\/.*)|[\n\r\s\t]/g;

class Rulebook {
	
	static parseRulebook(file){
		
		// Initialize Function
		Rulebook.__functions["Function"] = Rulebook.Function = function(stringFunction){
			
		};
		
		let result = file.replace(deleteRegex, '');
		let functions = [];
		while(result.length !== 0){
			let indexLastBracket = 0;
			
			let currentScope = 0;
			while(true){
				const char = result.charAt(indexLastBracket);
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
			
			functions.push(result.substr(0, indexLastBracket));
			result = result.substr(indexLastBracket, result.length);
		}
		
		for(let i = 0; i < functions.length; i++){
			let functionParts = [];
			let functionText = functions[i];
			let charIndex = 0;
			
			let currentScope = 0;
			while(true){
				const char = functionText.charAt(charIndex);
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
					const char = functionText.charAt(charIndex);
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
					const char = functionText.charAt(charIndex);
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
			
			if(functionText.charAt(0) !== '{' && functionText.charAt(functionText.length - 1) != '}'){
				throw Error("The inner part of the funciton did not close/open with braces properly");
			}
			
			functionText = functionText.substr(1, functionText.length - 2);
			
			while(functionText !== ""){
				const char = functionText.charAt(charIndex);
				if(char === 0) throw Error("There was an error parsing an object's contents.");
				if(char === '(' || char === '{'){
					currentScope++;
				}else if(char === ')' || char === '}'){
					currentScope--;
				}else if(char === ';' && currentScope === 0){
					functionParts[3].push(functionText.substr(0, charIndex));
					functionText = functionText.substr(charIndex + 1, functionText.length);
					charIndex = 0;
					continue;
				}
				charIndex++;
			}
			
			for(let j = 0; j < functionParts[3].length; j++){
				functionText = functionParts[3][j];
				let functionInside = [];
				if(functionText.substr(0, 5) !== "this.") throw Error("'this' was not used when declaring an object's property.");
			
				functionText = functionText.substr(5, functionText.length);
				charIndex = 0;
				while(true){
					const char = functionText.charAt(charIndex);
					if(char === '='){
						break;
					}
					charIndex++;
				}
				functionInside[0] = functionText.substr(0, charIndex);
				functionInside[1] = functionText.substr(charIndex + 1, functionText.length);
				
				functionParts[3][j] = functionInside;
			}
			
			for(let j = 0; j < functionParts[3].length; j++){
				const foundIndex = functionParts[3][j][1].indexOf("(")
				let varName = functionParts[3][j][1].substring(0, foundIndex === -1 ? functionParts[3][j][1].length : foundIndex);
				const fromThis = varName.substring(0, varName.indexOf(".")) === "this";
				const isString = functionParts[3][j][1].length === varName.length && !fromThis;
				varName = varName.substring(varName.indexOf(".") + 1);
				
				switch(varName){
				case "null":
					
					break;
				case "Function":
					const functionName = functionParts[0] + "." + functionParts[3][j][0];
					const functionString = functionParts[3][j][1].substring(foundIndex + 1, functionParts[3][j][1].lastIndexOf(")"));
					const functionParams = functionString.substring(functionString.indexOf("("), functionString.indexOf(")"));
					const functionContent = 
					Rulebook.__functions[functionName] = functionContent;
					break;
				default:
					if(isString){
						
					}else if(fromThis){
						
					}
					break;
				}
			}
			
			//console.log(functionText);
			
			console.log(functionParts);
		}
		
		console.log(Rulebook.__functions);
		console.log(Rulebook.__variables);
	}
}

Rulebook.__functions = [];
Rulebook.__variables = [];

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