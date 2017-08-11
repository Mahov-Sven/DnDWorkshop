var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var srtRegex = /[\n\r\s\t]+/g;
var menuIdPrepend = "Menu-Id-";

function Loader(){}

/* ------------ GENERAL FUNCTIONS ------------ */

function createDiv(){
	return document.createElement("div");
}

/* ------------ GENERAL FILE LOADING ------------ */

Loader.prototype.loadFile = function(fileLocation, callback){
	$.get(fileLocation, function(file){
		callback(file);
	});
}

/* ------------ HTML FILE LOADING ------------ */

Loader.prototype.loadHTML = function(fileLocation, callback){
	this.loadFile(fileLocation + htmlExt, function(html){
		callback(html);
	});
}

/* ------------ MENU FILE LOADING ------------ */

function createBaseMenu(){
	var html =
	'<div class = "MenuContainer">\n'+
	'	<div id="MENU" style="display:none;">\n'+
	'		<div class="Menu">\n'+ 
				menuIdPrepend + '\n'+
	'		</div>\n'+
	'	</div>\n'+
	'</div>\n';
	
	console.log(html);
	return html;
}

function createMenuSelection(MenuPath, MenuName){
	
	var html =
	'<div class="MenuSelection">\n'+
	'	<div class="MenuSelectionText">' + MenuName + '</div>\n'+
	'	<div class="MenuSelectionImg" style="display: none;"></div>\n'+
	'	<div class="SubMenuContainer">\n'+
	'		<div class="MenuContainer">\n'+
	'			<div class="Menu">\n'+ 
					menuIdPrepend + MenuPath + '\n'+
	'			</div>\n'+
	'		</div>\n'+
	'	</div>\n'+
	'</div>\n';
	
	console.log(html);
	
	return html;
}

Loader.prototype.loadMenuFile = function(fileLocation, callback){
	this.loadFile(fileLocation + menuFileExt, function(file){
		var trimmed = file.replace(srtRegex, '');
		var menuArray = trimmed.split(";").filter(function(token) {return token.length != 0});
		var html = "";
		
		var base = createBaseMenu();
		var subm = createMenuSelection("Main.Sub", "Test");
		
		for(var i = 0; i < menuArray.length; i++){
			var submenuData = menuArray[i].split(":");
			var submenuPathParts = submenuData[0].split(".");
			var submenuDataSplitLocation = submenuData[0].lastIndexOf(".");
			var submenuPath = submenuData[0].slice(0, submenuDataSplitLocation);
			var submenuName = submenuData[0].slice(submenuDataSplitLocation + 1, submenuData[0].length);
			var data = submenuData[1].substring(1, submenuData[1].length - 1).split(",");
			
			var currentPath = "";
			for(var j = 0; j < submenuPathParts.length; j++){
				var lookupPath = menuIdPrepend + currentPath + (currentPath.length > 0 ? "." : "") + submenuPathParts[j];
				
				
				
				currentPath += (j === 0 ? "" : ".") + submenuPathParts[j];
			}
		}
		
		callback(menuArray);
	});
}

/* ------------ PLAYER FILE LOADING ------------ */

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