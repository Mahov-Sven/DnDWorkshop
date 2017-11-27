class IllegalArgumentException extends Error{
	constructor(...params){
		super(...params);
		
		if (Error.captureStackTrace){
			Error.captureStackTrace(this, IllegalArgumentException);
		}
	}
}

class IllegalParseArgumentException extends IllegalArgumentException{
	constructor(...params){
		super(...params);
	}
}