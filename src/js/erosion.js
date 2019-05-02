import Water from './water';

class Erosion {

	static getCellIndex(cols, x, y) {
		return (y * cols) + x;
	}

	//assumes square grid
	static getRandomCoordinate(columnCount) {
		let x = Math.floor(Math.random() * columnCount);
		let y = Math.floor(Math.random() * columnCount);
		return {
			x: x,
			y: y
		};
	}

	//assumes square grid
	static getVerticeIndex(position, columnCount) {
		return Erosion.getCellIndex(columnCount, position.x, position.y);
	}

	*processErosion(vertices, columnCount, dropletCount) {
		let startCoordinate, startIndex, droplet, flow, flowResult;

		droplet = new Water();

		for (var i = 0; i < dropletCount; i++) {
			droplet.reset();
			startCoordinate = Erosion.getRandomCoordinate(columnCount);
			startIndex = Erosion.getVerticeIndex(startCoordinate, columnCount);
			droplet.position.set(startCoordinate.x, startCoordinate.y, droplet.position.z);
			if (vertices[startIndex * 3 + 2] > 0) {
				flow = this.waterFlow(vertices, startCoordinate, droplet, columnCount);
				flowResult = flow.next();

				while (!flowResult.done) {
					flowResult = flow.next();
				}


			//	droplet.position.set(new THREE.Vector3(vertices[startIndex * 3], vertices[startIndex * 3 + 1], vertices[startIndex * 3 + 2]))

				//vertices[startIndex * 3 + 2] += Math.random();
			}
			yield vertices;
		}
	}

	getNeighbourCoordinate(position, columnCount, xDifference, yDifference) {
		let neighbourCoordinate = new THREE.Vector2(position.x + xDifference, position.y + yDifference);
		if (
			neighbourCoordinate.x >= 0
			&& neighbourCoordinate.x < columnCount
			&& neighbourCoordinate.y >= 0
			&& neighbourCoordinate.y < columnCount) {
			return neighbourCoordinate;
		}
		else {
			return null;
		}
	}

	getNeighbours(array, position, columnCount) {
		let neighbours = [];
		let neighbour;

		if (position) {
			for (var x = -1; x < 2; x++) {
				for (var y = -1; y < 2; y++) {
					neighbour = this.getNeighbourCoordinate(new THREE.Vector2(position.x, position.y), columnCount, x, y);

					if (neighbour !== null && !(x == 0 && y == 0)) {
						neighbours.push(neighbour);
					}
				}
			}
		}
		return neighbours;
	}

	getLowestPointIndex(points) {
		let index = 0;
		if (points && points.length > 0) {
			for (var i = 1; i < points.length; i++) {
				if (points[i].z < points[index].z) {
					index = i;
				}
			}

			return index;
		}
	}

	//move water around the map
	*waterFlow(vertices, position, water, columnCount) {
		let neighbours = [];
		while (water.volume > 0) {
			water.volume -= 0.01;

			let neighbours = this.getNeighbours(vertices, water.position, columnCount)
			let lowestNeighbourIndex = this.getLowestPointIndex(neighbours.map((position) => {
				let index = Erosion.getVerticeIndex(position, columnCount);
				return new THREE.Vector3(vertices[index], vertices[index + 1], vertices[index + 2])
			}));

			let lowestNeighbour = neighbours[lowestNeighbourIndex];
			lowestNeighbourIndex = Erosion.getCellIndex(columnCount, lowestNeighbour.x, lowestNeighbour.y);


			let index = Erosion.getCellIndex(columnCount, water.position.x, water.position.y);


			if(vertices[index*3+2] > 0){
				let sedimentToRemove = vertices[index*3+2] / 1000;
				vertices[index*3+2] += sedimentToRemove;
			}
			else {
				//evaporate
				water.volume = 0;
			}

			water.position.set(lowestNeighbour.x, lowestNeighbour.y, water.position.z);

			yield water;
		}

		return water;
	}

	erode(geometry, columnCount, rowCount, dropletCount = 1000, stepsCount = 10) {
		let generator = this.processErosion(geometry.attributes.position.array, columnCount, dropletCount);
		let generation = {
			done: false
		};
		let processedVertices = [];

		while (!generation.done) {
			generation = generator.next();

			if (typeof (generation.value) !== 'undefined') {
				processedVertices = generation.value;
			}
		}

		geometry.attributes.position.array = processedVertices;
		geometry.attributes.position.needsUpdate = true;
	}
}

export default Erosion;