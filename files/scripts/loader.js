var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var srtRegex = /[\n\r\s\t]+/g;

function Loader(){}

Loader.prototype.loadFile = function(fileLocation, callback){
	$.get(fileLocation, function(file){
		callback(file);
	});
}

Loader.prototype.loadHTML = function(fileLocation, callback){
	this.loadFile(fileLocation + htmlExt, function(html){
		callback(html);
	});
}

Loader.prototype.loadMenuFile = function(fileLocation, callback){
	this.loadFile(fileLocation + menuFileExt, function(file){
		var trimmed = file.replace(srtRegex, '');
		var menuArray = trimmed.split(";").filter(function(token) {return token.length != 0});
		callback(menuArray);
	});
}

Loader.prototype.loadPlayerFile = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadRuleSet = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadSkillSet = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadSpellbook = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadInventory = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadItemShop = function(fileLocation, requireExtension){
	return null;
}

Loader.prototype.loadEncounter = function(fileLocation, requireExtension){
	return null;
}

var LOADER = new Loader();