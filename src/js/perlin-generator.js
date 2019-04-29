
class PerlinGenerator {
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
		this.canvasHeight = canvasElement.height;
		this.canvasWidth = canvasElement.width;
		this.context = canvasElement.getContext("2d");
	}


	getImageData(noiseFunction, scale) {
		let noise, index;
		let data = this.context.createImageData(this.canvasWidth, this.canvasHeight);
		for (let x = 0; x < this.canvasWidth; x++) {
			for (let y = 0; y < this.canvasHeight; y++) {
				index = 4 * (x + y * this.canvasWidth);
				noise = noiseFunction(x / scale, y / scale);

				data.data[index] = noise * 255;
				data.data[index + 1] = noise * 255;
				data.data[index + 2] = noise * 255;
				data.data[index + 3] = 255;
			}
		}

		return {
			imageData: data,
			x: 0,
			y: 0,
			dirtyX: 0,
			dirtyY: 0,
			dirtyWidth: this.canvasWidth,
			dirtyHeight: this.canvasHeight
		}
	}
}

export default PerlinGenerator;