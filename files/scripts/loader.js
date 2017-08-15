var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var srtRegex = /[\n\r\s\t]+/g;
var menuIdPrepend = "Menu-Id-";
var menuSubNameRegex = /Menu-Id-.*\n/g;

function Loader(){}

/* ------------ GENERAL FUNCTIONS ------------ */

function insertString(string, insertion, position){
	return string.substr(0, position) + insertion + string.substr(position);
}

Loader.prototype.loadIntoPage = function(id, html){
	document.getElementById(id).insertAdjacentHTML('afterbegin', html);
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
	
	return html;
}

function createMenuSelection(MenuPath, MenuName){
	
	var html =
	'<div class="MenuSelection">\n'+
	'	<div class="MenuSelectionText">' + MenuName + '</div>\n'+
	'	<div class="SubMenuContainer">\n'+
	'		<div class="MenuContainer">\n'+
	'			<div class="Menu">\n'+ 
					MenuPath + (MenuPath.length > menuIdPrepend.length ? "." : "") + MenuName + '\n'+
	'			</div>\n'+
	'		</div>\n'+
	'	</div>\n'+
	'</div>\n';
	
	return html;
}

function checkForSubmenu(html, submenuArray){
	var menuName = submenuArray.pop();
	var lookup = menuIdPrepend + submenuArray.join(".");
	var searchPosition = html.search(lookup + "\n");
	if(html.search(lookup) === -1){
		html = checkForSubmenu(html, submenuArray);
		searchPosition = html.search(lookup + "\n");
	}
	
	var menuString = createMenuSelection(lookup, menuName);
	return insertString(html, menuString, searchPosition);
}

function removeSubmenuNames(html, submenuArray){
	var menuName = submenuArray.pop();
	var lookup = menuIdPrepend + submenuArray.join(".");
	var searchPosition = html.search(lookup + "\n");
	if(html.search(lookup) !== -1){
		html = checkForSubmenu(html, submenuArray);
		searchPosition = html.search(lookup + "\n");
	}
	
	var menuString = createMenuSelection(lookup, menuName);
	return insertString(html, menuString, searchPosition);
}

Loader.prototype.loadMenuFile = function(fileLocation, callback){
	this.loadFile(fileLocation + menuFileExt, function(file){
		var trimmed = file.replace(srtRegex, '');
		var menuArray = trimmed.split(";").filter(function(token) {return token.length != 0});
		var html = createBaseMenu();
		
		for(var i = 0; i < menuArray.length; i++){
			var submenuData = menuArray[i].split(":");
			var submenuPathParts = submenuData[0].split(".");
			
			html = checkForSubmenu(html, submenuPathParts);
			
		}
		html = html.replace(menuSubNameRegex, '');
		
		callback(html);
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