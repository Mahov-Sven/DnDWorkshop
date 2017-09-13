var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var rulebookFileExt = ".dndrb";
var srtRegex = /[\n\r\s\t]+/g;
var menuIdPrepend = "Menu-Id-";
var menuSubNameRegex = /Menu-Id-.*\n/g;

/* ------------ GENERAL FUNCTIONS ------------ */

function insertString(string, insertion, position){
	return string.substr(0, position) + insertion + string.substr(position);
}

class Loader{
	constructor(){
		// DO NOTHING
	}
	
	static loadIntoPage(id, html){
		document.getElementById(id).insertAdjacentHTML('afterbegin', html);
	}
	
	static loadFile(fileLocation, callback){
		$.get(fileLocation, function(file){
			callback(file);
		});
	}
	
	static loadHTML(fileLocation, callback){
		this.loadFile(fileLocation + htmlExt, function(html){
			callback(html);
		});
	}
	
	static __createBaseMenu(){
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
	
	static __createMenuSelection(MenuPath, MenuName){
		
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
	
	static __checkForSubmenu(html, submenuArray){
		var menuName = submenuArray.pop();
		var lookup = menuIdPrepend + submenuArray.join(".");
		var searchPosition = html.search(lookup + "\n");
		if(html.search(lookup) === -1){
			html = Loader.__checkForSubmenu(html, submenuArray);
			searchPosition = html.search(lookup + "\n");
		}
		
		var menuString = Loader.__createMenuSelection(lookup, menuName);
		return insertString(html, menuString, searchPosition);
	}
	
	static __removeSubmenuNames(html, submenuArray){
		var menuName = submenuArray.pop();
		var lookup = menuIdPrepend + submenuArray.join(".");
		var searchPosition = html.search(lookup + "\n");
		if(html.search(lookup) !== -1){
			html = Loader.__checkForSubmenu(html, submenuArray);
			searchPosition = html.search(lookup + "\n");
		}
		
		var menuString = Loader.__createMenuSelection(lookup, menuName);
		return insertString(html, menuString, searchPosition);
	}
	
	static loadMenuFile(fileLocation, callback){
		this.loadFile(fileLocation + menuFileExt, function(file){
			var trimmed = file.replace(srtRegex, '');
			var menuArray = trimmed.split(";").filter(function(token) {return token.length != 0});
			var html = Loader.__createBaseMenu();
			
			for(var i = 0; i < menuArray.length; i++){
				var submenuData = menuArray[i].split(":");
				var submenuPathParts = submenuData[0].split(".");
				
				html = Loader.__checkForSubmenu(html, submenuPathParts);
				
			}
			html = html.replace(menuSubNameRegex, '');
			
			callback(html);
		});
	}
	
	static loadRulebook(fileLocation, callback){
		this.loadFile(fileLocation + rulebookFileExt, function(file){
			callback(Rulebook.parseRulebook(file));
		})
	}
	
	static loadPlayerFile(fileLocation, callback){
		return null;
	}
	
	static loadSkillSet(fileLocation, callback){
		return null;
	}
	
	static loadSpellbook(fileLocation, callback){
		return null;
	}
	
	static loadInventory(fileLocation, callback){
		return null;
	}
	
	static loadItemShop(fileLocation, callback){
		return null;
	}
	
	static loadEncounter(fileLocation, callback){
		return null;
	}
}