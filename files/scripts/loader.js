var htmlExt = ".dndhtml";
var menuFileExt = ".dndmf";
var rulebookFileExt = ".rbk";
var srtRegex = /[\n\r\s\t]+/g;
var menuIdPrepend = "Menu-Id-";
var menuSubNameRegex = /Menu-Id-.*\n/g;

/* ------------ GENERAL FUNCTIONS ------------ */

function insertString(string, insertion, position){
	return string.substr(0, position) + insertion + string.substr(position);
}

class Loader{
	
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
	
	static loadRulebook(fileLocation, fileName, callback){
		this.loadFile(`${fileLocation}/${fileName}${rulebookFileExt}`, function(file){
			callback(Rulebook.parseRulebook(file, fileLocation));
		})
	}
	
	static loadRulebookClass(fileLocation, fileName, callback, returnIndex){
		this.loadFile(`${fileLocation}/${fileName}${Loader.rulebookClassExt}`, function(file){
			callback(file, returnIndex);
		})
	}
}

Loader.rulebookClassExt = ".rbkc";