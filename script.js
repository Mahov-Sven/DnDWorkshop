$(document).ready(function () {
	
	// ------------- MAIN JAVASCRIPT STUFF -------------
	
	var showDice = false;
	
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
	renderer.setClearColor( 0x000000, 0.5 )
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
		if(showDice){
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
	
	$("#BUTTON_DICE").mouseup(function(){
		$("#CANVAS_OVERLAY").toggleClass("hide");
		$("#BUTTON_DICE").toggleClass("BUTTON_DICE_SHOW");
		showDice = !showDice;
		
		if(showDice){
			scene.onSimulationResume();
		}
	});
	
	//Function executed when clicking on the menuBox.
	$("#menuBox").toggle(function(){
		showMenu();
	}, function(){
		hideMenu();
	});
	
	// ------------- END OF JQUERY STUFF -------------
});