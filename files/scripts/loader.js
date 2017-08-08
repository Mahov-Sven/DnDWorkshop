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
	var MenuContainer = createDiv();
	MenuContainer.classList.add("MenuContainer");
	
	var MENU = createDiv();
	MENU.style.display = "none";
	MENU.id = "MENU";
	
	var menu = createDiv();
	menu.classList.add("Menu");
	menu.id = menuIdPrepend + "";
	
	MENU.appendChild(menu);
	MenuContainer.appendChild(MENU);
	
	console.log(MenuContainer);
	return MenuContainer;
}

function createSubMenu(MenuPath){
	var SubMenuContainer = createDiv();
	SubMenuContainer.classList.add("SubMenuContainer");
	
	var MenuContainer = createDiv();
	MenuContainer.classList.add("MenuContainer");
	
	var menu = createDiv();
	menu.classList.add("Menu");
	menu.id = menuIdPrepend + MenuPath;
	
	MenuContainer.appendChild(menu);
	SubMenuContainer.appendChild(MenuContainer);
	
	return SubMenuContainer;
}

function createMenuSelection(MenuName, MenuPath){
	var MenuSelection = createDiv();
	MenuSelection.classList.add("MenuSelection");
	
	var MenuSelectionText = createDiv();
	MenuSelectionText.classList.add("MenuSelectionText");
	MenuSelectionText.innerHTML = MenuName;
	
	var MenuSelectionImg = createDiv();
	MenuSelectionImg.classList.add("MenuSelectionImg");
	MenuSelectionImg.style.display = "none";
	
	var MenuSelectionSubMenu = createSubMenu(MenuPath);
	
	MenuSelection.appendChild(MenuSelectionText);
	MenuSelection.appendChild(MenuSelectionImg);
	MenuSelection.appendChild(MenuSelectionSubMenu);
	
	console.log(MenuSelection);
	
	return MenuSelection;
}

function attatchMenu(parentName, menuName){
	
}

Loader.prototype.loadMenuFile = function(fileLocation, callback){
	this.loadFile(fileLocation + menuFileExt, function(file){
		var trimmed = file.replace(srtRegex, '');
		var menuArray = trimmed.split(";").filter(function(token) {return token.length != 0});
		var html = "";
		
		var base = createBaseMenu();
		var subm = createMenuSelection("TEST", "MAIN.SUB");
		
		for(var i = 0; i < menuArray.length; i++){
			var submenuData = menuArray[i].split(":");
			var submenu = submenuData[0].split(".");
			var data = submenuData[1].substring(1, submenuData[1].length - 1).split(",");
			console.log(submenu);
			console.log(data);
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