import EventDispatcher from './event-dispatcher';

class Model {
	constructor(data) {
		this.data = data;
		this.events = {
			onChange: 'change'
		};
		this.eventDispatcher = new EventDispatcher();
	}

	set(property, value) {
		if (this.data.hasOwnProperty(property)) {
			this.data[property] = value;

			this.eventDispatcher.dispatch(this.events.onChange, this.data);
		}
	}

	update(data) {
		this.data = data;
		this.eventDispatcher.dispatch(this.events.onChange, this.data);
	}

	addEventListener(eventName, handler) {
		this.eventDispatcher.registerHandler(eventName, handler);
	}

}

class Binding {
	constructor(target, data) {
		this.bindings = [];
		this.model = new Model(data);
		let element = document.querySelector(target);

		let updateContent = (element, data) => {
			element.querySelectorAll('[data-model-value]').forEach((node) => {
				let value = node.getAttribute('data-model-value');

				if (data.hasOwnProperty(value)) {
					node.innerHTML = data[value];
				}
			});

			element.querySelectorAll('[data-bind-style]').forEach((node) => {
				let values = node.getAttribute('data-bind-style').split(':');
				if (values && values.length == 2) {
					let style = values[0];
					let value = values[1];

					if (data.hasOwnProperty(value)) {
						node.style[style] = data[value];
					}
				}
			});
		}

		//Listen to model changes and update UI accordingly.
		this.model.addEventListener('change', () => {
			updateContent(element, data);
		});

		updateContent(element, data);
	}

	update(data) {
		this.model.update(data);
	}

	set(property, value) {
		this.model.set(property, value);
	}
}

export { Model, Binding };