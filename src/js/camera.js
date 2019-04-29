import EventDispatcher from './event-dispatcher';

class Camera {
	constructor(position) {
		position = position || new THREE.Vector3( 0, 40, 40 );
		let camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 5000 );
		camera.position.copy(position);
		camera.lookAt(0,0,0);

		this.instance = camera;
	}
}

export default Camera;