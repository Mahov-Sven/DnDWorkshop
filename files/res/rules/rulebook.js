/* PARSING */
//const deleteRegex = /(\/\*[^*](.|\n)*?\*\/)|(\/\/.*)/g;

// For class parsing
const deleteRegex = /(\/\*(.|\n)*?\*\/)|(\/\/.*)/g;
const wordSeparators = [' ', '.', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const sentenceSeparators = [' ', '{', '}','[', ']', '\'', ':', ';', '"', '\'', '(', ')', ',', '\n', '\t'];
const contextStartSeparators = ['{', '[', '('];
const contextEndSeparators = ['}', ']', ')'];
const tsnExceptions = ['\t', ' ', '\n'];
const noExceptions = [];

class Rulebook {
	
	static parseRulebook(file, fileLocation){
		
		const readFiles = {};
		const rulebook = new DSBase();
		
		let text = file.replace(/(\/\*(.|\n)*?\*\/)|(\/\/.*)/g, '');
		text = file.replace(/\r\n/g, '\n');
		
		let parser = new Parser(
				text,
				[':', '[', ']', ',', '/', '\n', '\t', ' '],
				[':', '[', ']', ',', '\n', '\t', ' '],
				['['],
				[']', ';']
		);
		
		let token = "";
		
		let fileDone = false;
		while(true){
			switch(parser.match("Classes")){
			case 0:
				readFiles.classes = [];
				parser.afterWord();
				parser.expecting(":[", tsnExceptions);
				parser.nextContext();
				parser.next();
				while(true){
					if(parser.find("]", tsnExceptions)) break;
					parser.nextWord();
					token = parser.sentence();
					parser.afterSentence();
					if(parser.find(":[", tsnExceptions)){
						parser.nextContext();
						parser.next();
						let finished = parser.find("]", tsnExceptions);
						while(!finished){
							const cls = {};
							parser.nextWord();
							cls.location = `${token}/${parser.word()}`;
							cls.name = parser.word();
							readFiles.classes.push(cls);
							parser.afterWord();
							finished = parser.find("]|,]", tsnExceptions);
							if(!finished) parser.expecting(",");
						}
						parser.afterContext();
					}else{
						parser.previous();
						readFiles.classes.push(`${parser.word()}`);
						parser.next();
					}
					if(!parser.find("]|,]", tsnExceptions)){
						parser.expecting(",");
						parser.next();
					}else if(parser.find(",]", tsnExceptions)){
						parser.next();
					}
					
				}
				parser.expecting("];", tsnExceptions);
				parser.afterContext();
				break;
			default:
				parser.nextWord();
				if(!parser.end()) throw new IllegalParseArgumentException(`Unexpected token found. Expected the end of the document`);
				fileDone = true;
				break;
			}
			if(fileDone) break;
		}
			
		console.objStr(readFiles);
		
		Util.syncListProcess(readFiles.classes, 
				(cls, index, callback) => {
					Loader.loadRulebookClass(fileLocation, cls.location, index, callback)
					}, 
					
				(file, index) => {
					readFiles.classes[index].parser = new Parser(
							file,
							[':', '[', ']', ',', '/', '\n', '\t', ' ', '{', '}', '(', ')', ';', '.'], //word
							[':', '[', ']', ',', '\n', '\t', '{', '}', '(', ')', ';'], //sentence
							['[', '{', '('], //context start
							[']', '}', ')'] //context end
						);
					}, 
					
				() => {
					console.objStr(readFiles);
					console.log("----------------------------------------------------");
					console.log("====================================================");
					console.log("----------------------------------------------------");
					
					for(let clsI in readFiles.classes){
						const cls = readFiles.classes[clsI];
						const dsclass = new DSClass();
						
						dsclass.nameFull = cls.location.replace(/\//g, ".");
						rulebook.classes[dsclass.nameFull] = dsclass;
					}
					
					for(let clsI in readFiles.classes){
						const cls = readFiles.classes[clsI];
						const dsclass = rulebook.classes[cls.location.replace(/\//g, ".")];
						parser = cls.parser;
						console.log(parser.line());
						
						let count = 0;
						while(true && count < 100){
							count++;
							switch(parser.match("import|class", noExceptions)){
							case 0:
								let importName = parser.nextWord();
								parser.afterWord();
								while(parser.char() === '.'){
									parser.next();
									importName += '.' + parser.word();
									parser.afterWord();
								}
								dsclass.imports[importName] = rulebook.classes[importName];
								console.log(importName);
								break;
							case 1:
								//WORKING ON CLASS
							default:
								parser.next();
								break;
							}
						}
						
						
						
						console.objStr(dsclass);
						break;
					}
					//console.objStr(rulebook);
				}
			);
	}
}

class DSBase {
	constructor(){
		this.classes = {};
		this.objects = [];
		this.methods = {};
	}
}

class DSClass {
	constructor(){
		this.imports = {};
		this.supers = {};
		this.name = undefined;
		this.nameFull = undefined;
		this.methods = {};
		this.fields = {};
	}
}

class DSMethod {
	constructor(){
		this.method = undefined;
		this.name = undefined;
		this.description = undefined;
		this.returnType = undefined;
		this.paramDescriptions = {}
	}
}

class DSObject {
	constructor(){
		this.proto = undefined;
		this.fields = {};
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
		this._scope = 0;
		
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
			let sp = this._charPointer;
			let cp = 0;
			while(cp < arr[i].length){
				const char = arr[i].charAt(cp);
				const sChar = this.charAtIndex(sp);
				if(sp + cp >= this.length()) return false;
				if(!excp.has(sChar)){
					if(sChar === char){
						cp++;
					}else{
						found = false;
						break;
					}
				}
				sp++;
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
			let sp = this._charPointer;
			let cp = 0;
			while(cp < arr[i].length){
				const char = arr[i].charAt(cp);
				const sChar = this.charAtIndex(sp);
				if(sp + cp >= this.length()) return false;
				if(!excp.has(sChar)){
					if(sChar === char){
						cp++;
					}else{
						found = false;
						break;
					}
				}
				sp++;
			}
			if(found) return i;
		}
		return -1;
	}
	
	expecting(matchStr, exceptions = []){
		const result = this.match(matchStr, exceptions);
		if(result !== -1) return result;
		throw new IllegalParseArgumentException(`Unexpected token found.\nExpecting one of '${matchStr.split("|").join("' '")}'`);
	}
	
	after(matchStr, exceptions = []){
		const excp = new Set(exceptions);
		const arr = matchStr.split('|');
		const index = match(matchStr, exceptions);
		for(let i = 0; i < arr[index].length; i++){
			this.next();
		}
		return this.char();
	}
	
	charAtIndex(index){
		return this._text.charAt(index);
	}
	
	char(offset = 0){
		return this._text.charAt(this._charPointer + offset);
	}
	
	chars(length){
		return this._text.substring(this._charPointer, this._charPointer + length);
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
		this._updateWord();
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
		this._updateWord();
	}
	
	_parseContext(startChars, endChars){
		const part = [];
		let context = 0;
		
		let charPointer = this._charPointer - 1;
		let char = this._text.charAt(charPointer);
		while(charPointer >= 0 && (!startChars.has(char) || context !== 0)){
			if(startChars.has(char)) context++;
			if(endChars.has(char)) context--;
			charPointer--;
			char = this._text.charAt(charPointer);
		}
		
		this._scope = 0;
		let tCharPointer = this._charPointer;
		char = this._text.charAt(tCharPointer);
		while(tCharPointer >= 0){
			if(startChars.has(char)) this._scope++;
			if(endChars.has(char)) this._scope--;
			tCharPointer--;
			char = this._text.charAt(tCharPointer);
		}
		
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
		
		if(startChars.has(next)){
			while(next !== undefined && startChars.has(next)){
				next = this._previous();
			}
		}else{
			while(next !== undefined && endChars.has(next)){
				next = this._previous();
			}
		}
		
		this.next();
	}
	
	_nextContext(startChars, endChars){
		let next = this._next();
		while(next !== undefined && (!startChars.has(next) && !endChars.has(next))){
			next = this._next();
		}
		
		if(startChars.has(next)){
			while(next !== undefined && startChars.has(next)){
				next = this._next();
			}
		}else{
			while(next !== undefined && endChars.has(next)){
				next = this._next();
			}
		}
		this.previous();
	}
	
	_updateContext(){
		this._currentContext = this._parseContext(this._contextStartChars, this._contextEndChars);
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
	
	afterContext(){
		let next = this._next();
		while(next !== undefined && !this._contextEndChars.has(next)){
			next = this._next();
		}
		
		while(next !== undefined && this._contextEndChars.has(next)){
			next = this._next();
		}
		
		this._updateContext();
		return this.context();
	}
	
	scope(){
		return this._scope;
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
	
	length(){
		return this._text.length;
	}
	
	end(){
		return this._charPointer === this.length() - 1;
	}
}