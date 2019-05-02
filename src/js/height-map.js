import PerlinGenerator from './perlin-generator';

class HeightMap {
	constructor(canvasElement) {
		window.noise.seed(Math.random());
		this.scale = 100;
  		this.noiseImageContext = canvasElement.getContext("2d");
	 	this.generator = new PerlinGenerator(canvasElement);
		this.imageData = {};
		this.canvasElement = canvasElement;
	}

	getHeightArray(imgData, cols, rows) {
		let heightArray = [];
		let index = 0;
		for (let x = 0; x < cols; x++) {
			for (let y = 0; y < rows; y++) {
				index = 4 * (x + y * cols);
				heightArray.push(imgData[index]);
			}
		}
		return heightArray;
	}

	generate() {
		this.scale = Math.floor(Math.random() * 100) + 40;
		window.noise.seed(Math.random());
		this.imageData = this.generator.getImageData(noise.perlin2, this.scale);
	//document.getElementById('noise-canvas').getContext("2d").putImageData(this.imageData.imageData, this.imageData.x, this.imageData.y, this.imageData.dirtyX, this.imageData.dirtyY, this.imageData.dirtyWidth, this.imageData.dirtyHeight);

		return this.getHeightArray(this.imageData.imageData.data, this.canvasElement.width, this.canvasElement.height);
	}
}

export default HeightMap;