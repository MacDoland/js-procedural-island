import Utility from './utility';

class Architect {
	constructor(geometryDef) {
		if (geometryDef && geometryDef.length) {
			geometryDef = geometryDef.map((definition) => {
				switch (definition.type) {
					default:
						return {
							key: definition.name,
							geometry: new THREE.PlaneBufferGeometry(20, 20, 511, 511)
							//geometry: new THREE.PlaneGeometry(20, 20, 511, 511)
						};
						break;
				}
			});
		}

		this.geometrys = geometryDef;
	}

	get(key) {
		return this.geometrys.find((item) => {
			return item.key === key;
		});
	}

	clearHeights(geometry) {

		if (geometry.isBufferGeometry) {

			let positions = geometry.attributes.position.array;
			for (let j = 0; j < positions.length; j+=3) {
				positions[j+2] = 0;
			}

			geometry.attributes.position.needsUpdate = true;
		}
		else {

			for (var i = 0, l = geometry.vertices.length; i < l; i++) {
				geometry.vertices[i].z = 0;
			}

			geometry.computeVertexNormals();
			geometry.computeFaceNormals();
			geometry.verticesNeedUpdate = true;
		}
	}

	applyHeightmap(geometry, heightMap) {
		let heights = heightMap.generate();
		let maxDistance = 9;
		let rand = 0;

		if (geometry.isBufferGeometry) {
			let positions = geometry.attributes.position.array;

			for (var i = 0; i < positions.length; i += 3) {
				rand = (Math.floor(Math.random() * 10) + 1) / 10;
				let distance = Utility.distance({ x: positions[i], y: positions[i + 1], z: positions[i + 2] }, { x: 0, y: 0, z: 0 });
				let factor = (maxDistance - distance) / maxDistance;
				let newHeight = positions[i + 2] + (heights[i / 3] / 255 * 3) * factor;
				newHeight -= 0.1;

				if (newHeight < 0) {
					newHeight = 0;
				}

				positions[i + 2] = newHeight;
			}

		}
		else {
			for (var i = 0, l = geometry.vertices.length; i < l; i++) {
				rand = (Math.floor(Math.random() * 10) + 1) / 10;
				let distance = Utility.distance(geometry.vertices[i], { x: 0, y: 0, z: 0 });
				let factor = (maxDistance - distance) / maxDistance;
				let newHeight = geometry.vertices[i].z + (heights[i] / 255 * 3) * factor;
				newHeight -= 0.1;

				if (newHeight < 0) {
					newHeight = 0;
				}

				geometry.vertices[i].z = newHeight;
				//controlPanel.updateProgress(geometry.vertices.length / 1 * 100);
			}
		}

		return geometry;
	}

	vertexLerp(vertexFrom, vertexTo, step, maxStep) {
		let vFrom = vertexFrom.clone();
		let vTo = vertexTo.clone();
		let progress = step / maxStep;
		vTo.sub(vFrom);
		vTo.multiplyScalar(progress);
		vertexFrom.add(vTo);
		return vertexFrom.clone();
	}

	*AnimateFloat(from, to, duration){
		let startDate = new Date();
		let elapsedSeconds = 0;
		let currentValue = from;
		let difference = to - from;
		let progress = 0;

		while( elapsedSeconds < duration){
			elapsedSeconds = (new Date() - startDate) / 1000;
			progress = elapsedSeconds / duration;
			currentValue = from + difference * progress;

			yield currentValue;
		}
	}

	*MorphVertices(verticesFrom, verticesTo, steps) {
		let verticesCurrent = verticesFrom.slice(0);//clone array;
		let currentStep = 0;
		while (currentStep < steps) {
			verticesCurrent = verticesFrom.slice(0);
			verticesCurrent = verticesCurrent.map((vertex, index) => {
				return this.vertexLerp(vertex, verticesTo[index], currentStep, steps);
			})

			currentStep++;

			yield verticesCurrent;
		}
	}

	async morph(mesh, verticesFrom, verticesTo) {
		let steps = 10;
		let delay = 50;
		let generator = this.MorphVertices(verticesFrom, verticesTo, steps);
		let genResult;
		let slices = [];

		for (var i = 0; i < steps; i++) {
			genResult = generator.next();
			if (!genResult.done) {
				let result = genResult.value.slice(0);
				slices.push(result);
			}
		}


		let index = 0;
		while (index < steps) {
			mesh.geometry.vertices = slices[index];
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
			mesh.geometry = this.paintVertexLandscape(mesh.geometry);
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.colorsNeedUpdate = true;
			await Utility.sleep(delay);
			index++;
		}
	}

	async morphIt(mesh, morphIndex) {
		let influence = 0;
		let delay = 500;

		while (influence < 1) {

			influence += 0.1;
			mesh.morphTargetInfluences[morphIndex] = influence;

			await Utility.sleep(delay);
		}


	}
}

export default Architect;

