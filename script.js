$(document).ready(function () {
	
	// ------------- MAIN JAVASCRIPT STUFF -------------
	
	var render = false;
	
	var currentTab = 0;
	/*
	 * TAB IDs
	 * 0 => NULL
	 * 1 => Dice Button
	 * 2 => Menu Button
	 *
	 */
	
	function updateTabs(newTab){
		
		disableTab(currentTab);
		
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
				render = false;
				break;
				
			case 2:
				$("#BUTTON_MENU").removeClass("BUTTON_MENU_SHOW");
				$("#MENU_ANIM_BAR_T").stop().removeClass("RotateDown45").animate({width: "50%"});
				$("#MENU_ANIM_BAR_M").stop().removeClass("Fade");
				$("#MENU_ANIM_BAR_B").stop().removeClass("RotateUp45").animate({width: "50%"});
				$("#MAIN_CONTENT_CONTAINER").removeClass("UnfocusContentContainer");
				$("#MENU").stop(true,true).slideUp();
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
				scene.onSimulationResume();
				render = true;
				break;
				
			case 2:
				$("#BUTTON_MENU").addClass("BUTTON_MENU_SHOW");
				$("#MENU_ANIM_BAR_T").stop().addClass("RotateDown45").animate({width: "70.7%"});
				$("#MENU_ANIM_BAR_M").stop().addClass("Fade");
				$("#MENU_ANIM_BAR_B").stop().addClass("RotateUp45").animate({width: "70.7%"});
				$("#MAIN_CONTENT_CONTAINER").addClass("UnfocusContentContainer");
				$("#MENU").stop(true,true).slideDown();
				break;
		}
	}
	
	function getRenderingWidth(){
		return $("#CANVAS_OVERLAY").width();
	}
	
	function getRenderingHeight(){
		return $("#CANVAS_OVERLAY").height();
	}
	
	function getRenderingRatio(){
		return getRenderingWidth()/getRenderingHeight();
	}
	
	// ------------- END OF MAIN JAVASCRIPT STUFF -------------
	
	// ------------- 3D JAVASCRIPT STUFF -------------
	
	Physijs.scripts.worker = "lib/physijs/physijs_worker.js";
	Physijs.scripts.ammo = "ammo.js";
	
	var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
	renderer.setSize( getRenderingWidth(), getRenderingHeight() );
	renderer.setClearColor( 0x000000, 0.0 )
	renderer.domElement.style.position = "absolute";
	document.getElementById("CANVAS_OVERLAY").appendChild( renderer.domElement );

	var scene = new Physijs.Scene;

	var camera = new THREE.PerspectiveCamera(
		35,
		getRenderingRatio(),
		1,
		1000
	);
	camera.position.set( 60, 50, 60 );
	camera.lookAt( scene.position );
	scene.add( camera );

	// Box
	var box = new Physijs.BoxMesh(
		new THREE.CubeGeometry( 5, 5, 5 ),
		new THREE.MeshBasicMaterial({ color: 0x888888 })
	);
	scene.add( box );

	function animate() {
		requestAnimationFrame( animate );
		if(render){
			scene.simulate();
			renderer.render( scene, camera );
		}
	}
	animate();
	
	// ------------- END OF 3D JAVASCRIPT STUFF -------------
	
	// ------------- JQUERY STUFF -------------
	
	$(window).resize(function(){
		camera.aspect = getRenderingRatio();
		camera.updateProjectionMatrix();
		
		renderer.setSize(getRenderingWidth(), getRenderingHeight());
	});
	
	// ------------- END OF JQUERY STUFF -------------
	
	$("#BUTTON_DICE").mouseup(function(){
		updateTabs(1);
	});
	
	$("#BUTTON_MENU").mouseup(function(){
		updateTabs(2);
	});
});