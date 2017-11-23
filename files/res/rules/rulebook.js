/* PARSING */
//const deleteRegex = /(\/\*[^*](.|\n)*?\*\/)|(\/\/.*)|[\n\r\s\t]/g;
const deleteRegex = /(\/\*(.|\n)*?\*\/)|(\/\/.*)|[\n\r\s\t]/g;
const wordSeparators = [' ', '.', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const sentenceSeparators = [' ', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const contextStartSeparators = [' ', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const contextEndSeparators = [' ', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];

class Rulebook {
	
	static parseRulebook(file){
		
		let text = file.replace(deleteRegex, '');
		
		
	}
}

class Parser {
	constructor(string, wordSeparatorChars, sentenceSeparatorChars, contextStartChars, contextEndChars){
		this._text = string;
		this._wordSeparatorChars = new Set(wordSeparatorChars);
		this._sentenceSeparatorChars = new Set(sentenceSeparatorChars);
		this._contextStartChars = new Set(contextStartChars);
		this._contextEndChars = new Set(contextEndChars);
		this._charPointer = 0;
		this._currentWord = undefined;
		this._currentSentence = undefined;
		this._currentContext = undefined;
		
		this._updateWord();
	}
	
	char(){
		return this._text.charAt(this._charPointer);
	}
	
	_previous(){
		if(this._charPointer - 1 <= 0) return undefined;
		this._charPointer--;
		return this.char();
	}
	
	previous(){
		this._previous();
		if(this._currentWord === undefined || this._wordSeparatorChars.has(this.char())) this._updateWord();
		return this.char();
	}
	
	_next(){
		if(this._charPointer + 1 >= this._text.length) return undefined;
		this._charPointer++;
		return this.char();
	}
	
	next(){
		this._next();
		if(this._currentWord === undefined || this._wordSeparatorChars.has(this.char())) this._updateWord();
		return this.char();
	}
	
	_parsePart(startChars, endChars){
		const part = [];
		
		let charPointer = this._charPointer;
		let char = this._text.charAt(charPointer);
		while(charPointer >= 0 && !startChars.has(char)){
			charPointer--;
			char = this._text.charAt(charPointer);
		}
		
		charPointer++;
		char = this._text.charAt(charPointer);
		while(charPointer < this._text.length && !endChars.has(char)){
			part.push(char);
			charPointer++;
			char = this._text.charAt(charPointer);
		}
		
		return part.join('');
	}
	
	_previousPart(startChars, endChars){
		let previous = this._previous();
		while(previous !== undefined && !startChars.has(previous)){
			previous = this._previous();
		}
		
		while(previous !== undefined && startChars.has(previous)){
			previous = this._previous();
		}
		
		while(previous !== undefined && !endChars.has(previous)){
			previous = this._previous();
		}
		
		this._next();
	}
	
	_nextPart(startChars, endChars){
		let next = this._next();
		while(next !== undefined && !endChars.has(next)){
			next = this._next();
		}
		
		while(next !== undefined && endChars.has(next)){
			next = this._next();
		}
		
		while(next !== undefined && startChars.has(next)){
			next = this._next();
		}
	}
	
	_updateWord(){	
		this._currentWord = this._parsePart(this._wordSeparatorChars, this._wordSeparatorChars);
		if(this._wordSeparatorChars.has(this.char())) this._currentWord = undefined;
		this._updateSentence();
	}
	
	word(){
		return this._currentWord;
	}
	
	previousWord(){
		this._previousPart(this._wordSeparatorChars, this._wordSeparatorChars);
		this._updateWord();
		return this.word();
	}
	
	nextWord(){
		this._nextPart(this._wordSeparatorChars, this._wordSeparatorChars);
		this._updateWord();
		return this.word();
	}
	
	_updateSentence(){
		this._currentSentence = this._parsePart(this._sentenceSeparatorChars, this._sentenceSeparatorChars);
		if(this._sentenceSeparatorChars.has(this.char())) this._currentSentence = undefined;
		this._updateContext();
	}
	
	sentence(){
		return this._currentSentence;
	}
	
	previousSentence(){
		this._previousPart(this._sentenceSeparatorChars, this._sentenceSeparatorChars);
		this._updateSentence();
		return this.sentence();
	}
	
	nextSentence(){
		this._nextPart(this._sentenceSeparatorChars, this._sentenceSeparatorChars);
		this._updateSentence();
		return this.sentence();
	}
	
	_updateContext(){
		this._currentContext = this._parsePart(this._contextStartChars, this._contextEndChars);
		if(this._contextStartChars.has(this.char()) || this._contextEndChars.has(this.char())) this._currentContext = undefined;
	}
	
	context(){
		return this._currentContext;
	}
	
	previousContext(){
		this._previousPart(this._contextStartChars, this._contextEndChars);
		this._updateContext();
		return this.context();
	}
	
	nextContext(){
		this._nextPart(this._contextStartChars, this._contextEndChars);
		this._updateContext();
		return this.context();
	}
}