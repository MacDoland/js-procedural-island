class Utility {
	// Converts from degrees to radians.
	static radians(degrees) {
		return degrees * Math.PI / 180;
	};

	// Converts from radians to degrees.
	static degrees(radians) {
		return radians * 180 / Math.PI;
	};

	static difference(vectorA, vectorB) {
		return {
			x: vectorA.x - vectorB.x,
			y: vectorA.y - vectorB.y,
			z: vectorA.z - vectorB.z
		}
	}

	static distance(vectorA, vectorB) {
		let difference = Utility.difference(vectorA, vectorB);
		return Math.sqrt(
			Math.pow(difference.x, 2) +
			Math.pow(difference.y, 2) +
			Math.pow(difference.z, 2));
	}

	static sleep(ms) {
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				resolve();
			}, ms);
		});
	}

	static angle(vectorA, vectorB) {
		var dot = vectorA.dot(vectorB);
		var lengthA = vectorA.length();
		var lengthB = vectorB.length();

		return this.degrees(Math.acos(dot / (lengthA * lengthB)));
	}

	

	static morphVertices(verticesFrom, verticesTo, callback) {

		let steps, currentStep = 20;
		let delay = 200;
		let progress = 1;

		let process = (currentStep) => {
			currentStep--;
			progress = steps - (steps / currentStep);

			verticesFrom.map((vertex, index) => {
				let zFrom = vertex.position.z;
				let zTo = verticesTo[index].position.z;
				let difference = zTo - zFrom;
				return zfrom + difference * progress;
			});

			if (currentStep > 0) {
				setTimeout(process, delay);
			}
			else {
				callback(verticesFrom);
			}
		}
	}
}

export default Utility;