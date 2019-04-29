import EventDispatcher from './event-dispatcher';

class Controls {
	constructor(camera, canvasElement) {
		let controls = new THREE.OrbitControls(camera, canvasElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.screenSpacePanning = false;
		controls.minDistance = 10;
		controls.maxDistance = 300;
		controls.maxPolarAngle = Math.PI / 2;

		this.eventDispatcher = new EventDispatcher();
		this.eventDispatcher.addEvent('on-change');

		controls.addEventListener('change', (event) => {
			this.eventDispatcher.dispatch('change', {
				position: event.target.object.position,
				rotation: event.target.object.rotation
			});
		})

		this.controls = controls;
	}

	addEventListener(eventName, handler) {
		this.eventDispatcher.registerHandler(eventName, handler);
	}
}

export default Controls;