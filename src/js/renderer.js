class Renderer {
	constructor(scene, camera)
	{
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight, true);
		renderer.shadowMap.enabled = true;
		renderer.shadowMapSoft = true;
		renderer.shadowCameraNear = 1;
		renderer.shadowCameraFar = camera.far;
		renderer.shadowCameraFov = 50;
		renderer.shadowMapBias = 1;
		renderer.shadowMapDarkness = 0.25;
		renderer.shadowMapWidth = 2048;
		renderer.shadowMapHeight = 2048;
		//renderer.setClearColor( 0x819CD7, 1 );
		document.body.appendChild( renderer.domElement );

		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;

		this.draw = this.draw.bind(this);
		requestAnimationFrame(this.draw);
	}

	getElement(){
		return this.renderer.domElement;
	}

	draw() {
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame( this.draw );
	}
}

export default Renderer;