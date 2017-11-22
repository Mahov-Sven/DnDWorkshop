/* PARSING */
const deleteRegex = /(\/\*[^*](.|\n)*?\*\/)|(\/\/.*)|[\n\r\s\t]/g;
const wordSeparators = [' ', '.', '{', '}','[', ']', '\'', ';', '(', ')', ':', ',', '\n', '\t'];

class Rulebook {
	
	static parseRulebook(file){
		
		let text = file.replace(deleteRegex, '');
		
		
	}
}

class Parser {
	constructor(string, wordSeparatorChars, contextStartChars, contextEndChars){
		this.text = string;
		this.wordSeparatorChars = new Set(wordSeparatorChars);
		this.contextStartChars = new Set(contextStartChars);
		this.contextEndChars = new Set(contextEndChars);
		this.charPointer = 0;
		this.currentWord = undefined;
		this.currentContext = undefined;
		
		this._updateWord();
		//this._updateContext();
	}
	
	char(){
		return this.text.charAt(this.charPointer);
	}
	
	_previous(){
		if(this.charPointer - 1 <= 0) return undefined;
		this.charPointer--;
		return this.char();
	}
	
	previous(){
		this._previous();
		if(this.currentWord === undefined || this.wordSeparatorChars.has(this.char())) this._updateWord();
		return this.char();
	}
	
	_next(){
		if(this.charPointer + 1 >= this.text.length) return undefined;
		this.charPointer++;
		return this.char();
	}
	
	next(){
		this._next();
		if(this.currentWord === undefined || this.wordSeparatorChars.has(this.char())) this._updateWord();
		return this.char();
	}
	
	_updateWord(){
		if(this.wordSeparatorChars.has(this.char())) this.currentWord === undefined;
		const word = [];
		
		let charPointer = this.charPointer;
		let char = this.text.charAt(charPointer);
		while(charPointer >= 0 && !this.wordSeparatorChars.has(char)){
			charPointer--;
			char = this.text.charAt(charPointer);
		}
		if(charPointer === -1) this.currentWord = undefined;
		
		charPointer++;
		char = this.text.charAt(charPointer);
		while(charPointer < this.text.length && !this.wordSeparatorChars.has(char)){
			word.push(char);
			charPointer++;
			char = this.text.charAt(charPointer);
		}
		
		this.currentWord = word.join('');
	}
	
	word(){
		return this.currentWord;
	}
	
	nextWord(){
		let next = this._next();
		while(next !== undefined && !this.wordSeparatorChars.has(next)){
			next = this._next();
		}
		
		while(next !== undefined && this.wordSeparatorChars.has(next)){
			next = this._next();
		}
		this._updateWord();
		return this.word();
	}
	
	nextContext(){
		
	}
}