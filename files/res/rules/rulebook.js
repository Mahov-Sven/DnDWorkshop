/* PARSING */
//const deleteRegex = /(\/\*[^*](.|\n)*?\*\/)|(\/\/.*)/g;

// For class parsing
const deleteRegex = /(\/\*(.|\n)*?\*\/)|(\/\/.*)/g;
const wordSeparators = [' ', '.', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const sentenceSeparators = [' ', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const contextStartSeparators = ['{', '[', '('];
const contextEndSeparators = ['}', ']', ')'];

class Rulebook {
	
	static parseRulebook(file){
		
		const rulebook = {
				classes: [],
		}
		
		let text = file.replace(/(\/\*(.|\n)*?\*\/)|(\/\/.*)/g, '');
		
		const rulebookParser = new Parser(
				text,
				[':', '[', ']', ',', '/', '\n', '\t', ' '],
				[':', '[', ']', ',', '\n', '\t', ' '],
				['[', ';'],
				[']', ';']
		);
		
		let token = "";
		const result = {};
		while(true){
			console.log(rulebookParser.line());
			switch(rulebookParser.expecting("Classes")){
			case 0:
				result.classes = [];
				rulebookParser.afterWord();
				rulebookParser.expecting(":[", ['\t', ' ', '\n']);
				rulebookParser.nextContext();
				
				while(true){
					token = rulebookParser.sentence();
					rulebookParser.afterSentence();
					switch(rulebookParser.match(":[", ['\t', ' ', '\n'])){
					case 0:
						const loc = [];
						rulebookParser.nextContext();
						let finished = rulebookParser.find("]|],", ['\t', ' ', '\n']);
						
						while(!finished){
							loc.push(rulebookParser.word());
							rulebookParser.afterWord();
							finished = rulebookParser.find("]|],", ['\t', ' ', '\n']);
							if(!finished) rulebookParser.expecting(",", ['\t', ' ', '\n']);
							rulebookParser.nextWord();
						}
						
						result.classes.push(loc);
						break;
					default:
						result.classes.push(token);
						break;
					}
					rulebookParser.nextContext();
					console.log(rulebookParser.line());
					break;
				}
				
				break;
			}
			
			break;
		}
		
		console.log(result);
	}
}

class Parser {
	constructor(string, wordSeparatorChars, sentenceSeparatorChars, contextStartChars, contextEndChars){
		this._text = string;
		this._wordSeparatorChars = new Set(wordSeparatorChars);
		this._sentenceSeparatorChars = new Set(sentenceSeparatorChars);
		this._contextStartChars = new Set(contextStartChars);
		this._contextEndChars = new Set(contextEndChars);
		this._lineSeparators = new Set(['\n']);
		this._charPointer = 0;
		this._currentWord = undefined;
		this._currentSentence = undefined;
		this._currentContext = undefined;
		this._currentLine = undefined;
		
		this._updateWord();
		this._updateLine();
	}
	
	setText(text){
		this._text = text;
		this._charPointer = 0;
		this._currentWord = undefined;
		this._currentSentence = undefined;
		this._currentContext = undefined;
		this._currentLine = undefined;
		
		this._updateWord();
		this._updateLine();
	}
	
	find(matchStr, exceptions = []){
		const excp = new Set(exceptions);
		const arr = matchStr.split('|');
		for(let i = 0; i < arr.length; i++){
			let found = true;
			for(let c = 0; c < arr[i].length; c++){
				const char = arr[i].charAt(c);
				const sChar = this.char(c);
				if(sChar !== char && !excp.has(sChar)){
					found = false;
					break;
				}
			}
			if(found) return true;
		}
		return false;
	}
	
	match(matchStr, exceptions = []){
		const excp = new Set(exceptions);
		const arr = matchStr.split('|');
		for(let i = 0; i < arr.length; i++){
			let found = true;
			for(let c = 0; c < arr[i].length; c++){
				const char = arr[i].charAt(c);
				const sChar = this.char(c);
				if(sChar !== char && !excp.has(sChar)){
					found = false;
					console.log(sChar, char, excp);
					break;
				}
			}
			if(found) return i;
		}
		return undefined;
	}
	
	expecting(matchStr, exceptions = []){
		const result = this.match(matchStr, exceptions);
		if(result !== undefined) return result;
		throw new IllegalParseArgumentException(`Error parsing text.\nExpecting one of '${arr.join(", ")}'`);
	}
	
	charAtIndex(index){
		return this._text.charAt(index);
	}
	
	char(offset = 0){
		return this._text.charAt(this._charPointer + offset);
	}
	
	_previous(){
		if(this._charPointer - 1 <= 0) return undefined;
		this._charPointer--;
		if(this._lineSeparators.has(this.char())) this._updateLine();
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
		if(this._lineSeparators.has(this.char())) this._updateLine();
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
	
	afterWord(){
		let next = this._next();
		while(next !== undefined && !this._wordSeparatorChars.has(next)){
			next = this._next();
		}
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
	
	afterSentence(){
		let next = this._next();
		while(next !== undefined && !this._sentenceSeparatorChars.has(next)){
			next = this._next();
		}
	}
	
	_parseContext(startChars, endChars){
		const part = [];
		
		let charPointer = this._charPointer;
		let char = this._text.charAt(charPointer);
		while(charPointer >= 0 && !startChars.has(char)){
			charPointer--;
			char = this._text.charAt(charPointer);
		}
		
		let context = 0;
		charPointer++;
		char = this._text.charAt(charPointer);
		while(charPointer < this._text.length && (!endChars.has(char) || context !== 0)){
			if(startChars.has(char)) context++;
			if(endChars.has(char)) context--;
			part.push(char);
			charPointer++;
			char = this._text.charAt(charPointer);
		}
		
		return part.join('');
	}
	
	_previousContext(startChars, endChars){
		let previous = this._previous();
		while(previous !== undefined && !startChars.has(previous) && !endChars.has(previous)){
			previous = this._previous();
		}
		
		while(previous !== undefined && (startChars.has(previous) || endChars.has(previous))){
			previous = this._previous();
		}
		
		this.previous();
		if(this.word() === undefined) this.previousWord();
	}
	
	_nextContext(startChars, endChars){
		let next = this._next();
		while(next !== undefined && !startChars.has(next) && !endChars.has(next)){
			next = this._next();
		}
		
		while(next !== undefined && (startChars.has(next) || endChars.has(next))){
			next = this._next();
		}
		
		this.next();
		if(this.word() === undefined) this.nextWord();
	}
	
	_updateContext(){
		this._currentContext = this._parseContext(this._contextStartChars, this._contextEndChars);
		if(this._contextStartChars.has(this.char()) || this._contextEndChars.has(this.char())) this._currentContext = undefined;
	}
	
	context(){
		return this._currentContext;
	}
	
	previousContext(){
		this._previousContext(this._contextStartChars, this._contextEndChars);
		this._updateContext();
		return this.context();
	}
	
	nextContext(){
		this._nextContext(this._contextStartChars, this._contextEndChars);
		this._updateContext();
		return this.context();
	}
	
	_updateLine(){
		this._currentLine = this._parsePart(this._lineSeparators, this._lineSeparators);
	}
	
	line(){
		return this._currentLine;
	}
	
	previousLine(){
		this._previousPart(this._lineSeparators, this._lineSeparators);
		this._updateLine();
		return this.line();
	}
	
	nextLine(){
		this._nextPart(this._lineSeparators, this._lineSeparators);
		this._updateLine();
		return this.line();
	}
}