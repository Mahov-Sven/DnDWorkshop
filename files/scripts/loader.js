var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var srtRegex = /[\n\r\s\t]+/g;

var LOADER = {
	loadFile: null,
	loadHTML: null,
	loadMenuFile: null,
	loadPlayerFile: null,
	loadRuleSet: null,
	loadSkillSet: null,
	loadSpellbook: null,
	loadInventory: null,
	loadItemShop: null,
	loadEncounter: null,
}

LOADER.loadFile = function(fileLocation, callback){
	$.get(fileLocation, function(file){
		callback(file);
	});
}

LOADER.loadHTML = function(fileLocation, callback){
	LOADER.loadFile(fileLocation + htmlExt, function(html){
		callback(html);
	});
}

LOADER.loadMenuFile = function(fileLocation, callback){
	LOADER.loadFile(fileLocation + menuFileExt, function(file){
		var trimmed = file.replace(srtRegex, '');
		var menuArray = trimmed.split(";");
		callback(menuArray);
	});
}

LOADER.loadPlayerFile = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadRuleSet = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadSkillSet = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadSpellbook = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadInventory = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadItemShop = function(fileLocation, requireExtension){
	return null;
}

LOADER.loadEncounter = function(fileLocation, requireExtension){
	return null;
}