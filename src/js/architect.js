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

	paintVertexLandscape(geometry) {
		var cols = [{
			stop: 0,
			color: new THREE.Color(0x4667A4)
		}, {
			stop: .01,
			color: new THREE.Color(0xD7BC81)
		},
		{
			stop: .05,
			color: new THREE.Color(0xD7BC81)
		},
		{
			stop: .07,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: .69,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: .7,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: 1,
			color: new THREE.Color(0x6CA469)
		}];

		geometry = setGradient(geometry, cols, 'z', false);

		function setGradient(geometry, colors, axis, reverse) {

			geometry.computeBoundingBox();

			var bbox = geometry.boundingBox;
			var size = new THREE.Vector3().subVectors(bbox.max, bbox.min);

			var vertexIndices = ['a', 'b', 'c'];
			var face, vertex, normalized = new THREE.Vector3(),
				normalizedAxis = 0;

			for (var c = 0; c < colors.length - 1; c++) {

				var colorDiff = colors[c + 1].stop - colors[c].stop;

				for (var i = 0; i < geometry.faces.length; i++) {
					face = geometry.faces[i];
					for (var v = 0; v < 3; v++) {

						vertex = geometry.vertices[face[vertexIndices[v]]];
						normalizedAxis = normalized.subVectors(vertex, bbox.min).divide(size)[axis];

						if (reverse) {
							normalizedAxis = 1 - normalizedAxis;
						}

						if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
							var localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;

							if (!face.vertexColors[v]) {
								face.vertexColors[v] = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis);
							}
							else {
								face.vertexColors[v].copy(colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis));
							}
						}

						let angle = Utility.angle(face.normal, new THREE.Vector3(0, 0, 1));


						//sand
						if (angle > 1 && angle < 15 && normalizedAxis > 0.005 && normalizedAxis < 0.05) {
							if (face.vertexColors[v]) {
								face.vertexColors[v].copy(new THREE.Color(0xD7BC81));
							}
							else {
								face.vertexColors[v] = (new THREE.Color(0xD7BC81));
							}
						}
						//grass
						if (angle >= 0 && angle <= 40 && normalizedAxis > 0.2 && normalizedAxis < 0.4) {
							if (face.vertexColors[v]) {
								face.vertexColors[v].copy(new THREE.Color(0x6CA469));
							}
							else {
								face.vertexColors[v] = (new THREE.Color(0x6CA469));
							}
						}

						//Rock at angles
						if (angle > 40 && normalizedAxis > 0.05 && normalizedAxis < 0.8) {
							if (face.vertexColors[v]) {
								face.vertexColors[v].copy(new THREE.Color(0x9C9C9C));
							}
							else {
								face.vertexColors[v] = (new THREE.Color(0x9C9C9C));
							}
						}

						//snow
						if (normalizedAxis > 0.75) {
							if (face.vertexColors[v]) {
								face.vertexColors[v].copy(new THREE.Color(0xFFFFFF));
							}
							else {
								face.vertexColors[v] = (new THREE.Color(0xFFFFFF));
							}
						}
					}



				}
			}


			return geometry;
		}


		geometry.colorsNeedUpdate = true;
		return geometry;

	};

	paintVertexBufferLandscape(geometry) {
		var cols = [{
			stop: 0,
			color: new THREE.Color(0x4667A4)
		}, {
			stop: .01,
			color: new THREE.Color(0xD7BC81)
		},
		{
			stop: .05,
			color: new THREE.Color(0xD7BC81)
		},
		{
			stop: .07,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: .69,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: .7,
			color: new THREE.Color(0x6CA469)
		},
		{
			stop: 1,
			color: new THREE.Color(0x6CA469)
		}];

		geometry = setGradient(geometry, cols, 'z', false);

		function setGradient(geometry, colors, axis, reverse) {

			let axisIndex = 0;

			switch (axis) {
				case 'x':
					axisIndex = 0;
					break;
				case 'y':
					axisIndex = 1;
					break;
				case 'z':
					axisIndex = 2;
					break;
			}

			geometry.computeBoundingBox();

			var bbox = geometry.boundingBox;
			var size = new THREE.Vector3().subVectors(bbox.max, bbox.min);

			var vertexIndices = ['a', 'b', 'c'];
			var face, vertex, normalized = new THREE.Vector3(),
				normalizedAxis = 0;
			let positions = geometry.attributes.position.array;
			let normals = geometry.attributes.normal.array;
			let vertexColors = new Float32Array( geometry.attributes.position.array.length );

			for (var c = 0; c < colors.length - 1; c++) {

				var colorDiff = colors[c + 1].stop - colors[c].stop;

				for (var i = 0; i < positions.length; i+=3) {

						vertex = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
						normalizedAxis = normalized.subVectors(vertex, bbox.min).divide(size)[axis];

						if (reverse) {
							normalizedAxis = 1 - normalizedAxis;
						}

						if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
							var localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;
							let color = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis);
								vertexColors[i] = color.r;
								vertexColors[i+1] = color.g;
								vertexColors[i+2] = color.b;
							
						}

						let angle = Utility.angle(new THREE.Vector3(normals[i],normals[i+1],normals[i+2]), new THREE.Vector3(0, 0, 1));


						//sand
						if (angle > 1 && angle < 15 && normalizedAxis > 0.005 && normalizedAxis < 0.05) {
							let color = new THREE.Color(0xD7BC81);
							vertexColors[i] = color.r;
							vertexColors[i+1] = color.g;
							vertexColors[i+2] = color.b;
						}
						//grass
						if (angle >= 0 && angle <= 40 && normalizedAxis > 0.2 && normalizedAxis < 0.4) {
							let color = new THREE.Color(0x6CA469);
							vertexColors[i] = color.r;
							vertexColors[i+1] = color.g;
							vertexColors[i+2] = color.b;
						}

						//Rock at angles
						if (angle > 40 && normalizedAxis > 0.05 && normalizedAxis < 0.8) {
							let color = new THREE.Color(0x9C9C9C);
							vertexColors[i] = color.r;
							vertexColors[i+1] = color.g;
							vertexColors[i+2] = color.b;
						}

						//snow
						if (normalizedAxis > 0.75) {
							let color = new THREE.Color(0xFFFFFF);
							vertexColors[i] = color.r;
							vertexColors[i+1] = color.g;
							vertexColors[i+2] = color.b;
						}



				}
			}

			geometry.addAttribute('color', new THREE.BufferAttribute( vertexColors, 3 ) );
			return geometry;
		}


		geometry.colorsNeedUpdate = true;
		return geometry;

	};

	vertexLerp(vertexFrom, vertexTo, step, maxStep) {
		let vFrom = vertexFrom.clone();
		let vTo = vertexTo.clone();
		let progress = step / maxStep;
		vTo.sub(vFrom);
		vTo.multiplyScalar(progress);
		vertexFrom.add(vTo);
		return vertexFrom.clone();
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