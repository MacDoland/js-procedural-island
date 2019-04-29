import EventDispatcher from './event-dispatcher';
import { Binding } from './binding';


class ControlPanel {
	constructor(targetSelector){
		let target = document.querySelector(targetSelector);

		this.data = {
			'cameraPositionX': 0,
			'cameraPositionY': 0,
			'cameraPositionZ': 0,
			'morphProgress': 0
		};

		if(typeof(target) !== 'undefined' && target !== null){
			this.events = {}
			this.eventDispatcher = new EventDispatcher();
			this.binding = new Binding('#ui-control-panel', this.data);
		}
	}

	updateProgress(value){
		this.data.morphProgress = value.toString() +'%';
		this.binding.update(this.data);
	}

	updateCameraRotation({x, y, z}){
		this.data.cameraRotationX = x.toFixed(2);
		this.data.cameraRotationY = y.toFixed(2);
		this.data.cameraRotationZ = z.toFixed(2);

		this.binding.update(this.data);
	}

	updateCameraPosition({x, y, z}){
		this.data.cameraPositionX = x.toFixed(2);
		this.data.cameraPositionY = y.toFixed(2);
		this.data.cameraPositionZ = z.toFixed(2);

		this.binding.update(this.data);
	}
}

export default ControlPanel;