$(document).ready(function () {
	var currentTab = 0;
	/*
	 * TAB IDs
	 * 0 => NULL
	 * 1 => Dice Button
	 * 2 => Menu Button
	 *

	/*
	DICE => The dice.js file. Renders the dice screen.

	LOADER => The loader.js file. Loads files.

	*/
	
	// ------------- INITIALIZATION STUFF -------------

	DICE.init("files/lib/physijs/physijs_worker.js", "CANVAS_OVERLAY", $("#CANVAS_OVERLAY").width(), $("#CANVAS_OVERLAY").height());
	LOADER.loadMenuFile("files/html/menu", function(html){
		console.log(html);
	});
	
	// ------------- END OF INITIALIZATION STUFF -------------
	
	// ------------- MAIN JAVASCRIPT STUFF -------------

	function updateTabs(newTab){
		
		disableTab(currentTab);
		console.log(newTab + " | " + currentTab);
		if(newTab !== currentTab){
			enableTab(newTab);
			currentTab = newTab;
		}else{
			currentTab = 0;
		}
	}

	function disableTab(tab){
		switch(tab){
			case 0:
				break;
				
			case 1:
				$("#CANVAS_OVERLAY").addClass("hide");
				$("#BUTTON_DICE").removeClass("BUTTON_DICE_SHOW");
				DICE.stop();
				break;
				
			case 2:
				$("#BUTTON_MENU").removeClass("BUTTON_MENU_SHOW");
				$("#MENU_ANIM_BAR_T").stop().removeClass("RotateDown45").animate({width: "50%"});
				$("#MENU_ANIM_BAR_M").stop().removeClass("Fade");
				$("#MENU_ANIM_BAR_B").stop().removeClass("RotateUp45").animate({width: "50%"});
				$("#MAIN_CONTENT_CONTAINER").removeClass("UnfocusContentContainer");
				$("#MENU").stop().animate({top: -$("#MENU").height() }, function(){$("#MENU").hide()} );
				break;
		}
	}

	function enableTab(tab){
		switch(tab){
			case 0:
				break;
				
			case 1:
				$("#CANVAS_OVERLAY").removeClass("hide");
				$("#BUTTON_DICE").addClass("BUTTON_DICE_SHOW");
				DICE.start();
				break;
				
			case 2:
				$("#BUTTON_MENU").addClass("BUTTON_MENU_SHOW");
				$("#MENU_ANIM_BAR_T").stop().addClass("RotateDown45").animate({width: "70%"});
				$("#MENU_ANIM_BAR_M").stop().addClass("Fade");
				$("#MENU_ANIM_BAR_B").stop().addClass("RotateUp45").animate({width: "70%"});
				$("#MAIN_CONTENT_CONTAINER").addClass("UnfocusContentContainer");
				$("#MENU").show().stop().animate({top: "0"});
				break;
		}
	}

	// ------------- END OF MAIN JAVASCRIPT STUFF -------------

	// ------------- JQUERY STUFF -------------

	$(window).resize(function(){
		DICE.resize($("#CANVAS_OVERLAY").width(), $("#CANVAS_OVERLAY").height() );
	});

	$("#BUTTON_DICE").mouseup(function(){
		updateTabs(1);
	});

	$("#BUTTON_MENU").mouseup(function(){
		updateTabs(2);
	});

	$("#MENU").stop().animate({top: -$("#MENU").height() }, function(){$("#MENU").hide()} );

	// ------------- END OF JQUERY STUFF -------------
});

