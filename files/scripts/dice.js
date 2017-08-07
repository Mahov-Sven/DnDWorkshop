var render = false;
var renderer;
var scene;
var camera;

function Dice(){}

Dice.prototype.init = function(physicsWorkerLocation, canvasContainerID, renderingWidth, renderingHeight){
	Physijs.scripts.worker = physicsWorkerLocation;
	Physijs.scripts.ammo = "ammo.js";
	
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
	renderer.setSize( renderingWidth, renderingHeight );
	renderer.setClearColor( 0x000000, 0.0 )
	renderer.domElement.style.position = "absolute";
	document.getElementById("CANVAS_OVERLAY").appendChild( renderer.domElement );

	scene = new Physijs.Scene;

	camera = new THREE.PerspectiveCamera(
		35,
		renderingWidth / renderingHeight,
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
}

Dice.prototype.start = function(){
	render = true;
	scene.onSimulationResume();
}

Dice.prototype.stop = function(){
	render = false;
}

Dice.prototype.resize = function(width, height){
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	
	renderer.setSize(width, height);
}

var DICE = new Dice();

