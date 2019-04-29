import Architect from './architect';
import Artist from './artist';
import Camera from './camera';
import ControlPanel from './control-panel';
import Controls from './controls';
import HeightMap from './height-map';
import Renderer from './renderer';
import Scene from './scene';
import Utility from './utility';
import data from '../data/data.json';

(function () {

	let architect = new Architect(data.geometry);
	let artist = new Artist(data.materials);
	let scene = new Scene();
	let camera = new Camera();
	let renderer = new Renderer(scene.scene, camera.instance);
	let canvas = renderer.getElement();
	let controls = new Controls(camera.instance, canvas);
	let controlPanel = new ControlPanel('#ui-control-panel');
	let heightMap = new HeightMap(document.getElementById('noise-canvas'));
	let meshes = [];

	data.objects.forEach((item) => {
		let geometry = architect.get(item.geometry).geometry;
		let material = artist.get(item.material).material;
		let mesh = new THREE.Mesh(geometry, material);

		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.rotation.x = Utility.radians(-90);
		mesh.rotation.z = Utility.radians(-270);
		scene.scene.add(mesh);
		meshes.push(mesh);
	});

	//noiseImageContext.putImageData(imageData.imageData, imageData.x, imageData.y, imageData.dirtyX, imageData.dirtyY, imageData.dirtyWidth, imageData.dirtyHeight);

	controls.addEventListener('change', (update) => {
		controlPanel.updateCameraPosition(update.position);
	});

	controls.addEventListener('change', (update) => {
		controlPanel.updateCameraRotation(update.rotation);
	});

	var light = new THREE.AmbientLight(0x404040, 4); // soft white light
	scene.scene.add(light);

	var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
	directionalLight.castShadow = true;
	directionalLight.position.x = 10;
	directionalLight.position.y = 7.5;
	directionalLight.position.z = 5;
	directionalLight.target.position.set(0, 0, 0);

	//Set up shadow properties for the light
	directionalLight.shadow.mapSize.width = 2048;  // default
	directionalLight.shadow.mapSize.height = 2048; // default

	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 30;
	directionalLight.shadow.camera.left = -15;
	directionalLight.shadow.camera.bottom = -15;
	directionalLight.shadow.camera.right = 15;
	directionalLight.shadow.camera.top = 15;

	//var shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
	//shadowCameraHelper.visible = true;
	//scene.scene.add(shadowCameraHelper);

	scene.scene.add(directionalLight);

	let getColour = function (height) {
		let colour = 0xD7BC81;
		if (height < 1) {
			color = 0x819CD7;
		}

		return colour;
	}




	controlPanel.updateProgress(0);
	//architect.clearHeights(meshes[0].geometry);
	let mesh = meshes[0];
	let geometry = architect.applyHeightmap(mesh.geometry, heightMap);
	geometry = architect.applyHeightmap(geometry, heightMap);
	geometry = architect.applyHeightmap(geometry, heightMap);
	geometry = architect.applyHeightmap(geometry, heightMap);
	geometry = architect.applyHeightmap(geometry, heightMap);
	geometry = architect.applyHeightmap(geometry, heightMap);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	mesh.geometry.attributes.position.needsUpdate = true;
	mesh.geometry.attributes.normal.needsUpdate = true;

	mesh.geometry = architect.paintVertexBufferLandscape(geometry);
	mesh.geometry.attributes.color.needsUpdate = true;
	mesh.geometry.verticesNeedUpdate = true;
	mesh.geometry.colorsNeedUpdate = true;
	mesh.morphTargetInfluences = [];

	let morphIndex = 0;

	document.getElementById('terrain-generate').addEventListener('click', function () {

		let mesh = meshes[0];
		architect.clearHeights(geometry);

		geometry = architect.get('default-plane').geometry;
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry = architect.applyHeightmap(geometry, heightMap);
		geometry.computeVertexNormals();
		geometry.computeFaceNormals();
		mesh.geometry.attributes.position.needsUpdate = true;
		mesh.geometry.attributes.normal.needsUpdate = true;

		mesh.geometry = architect.paintVertexBufferLandscape(geometry);
		mesh.geometry.attributes.color.needsUpdate = true;
		mesh.geometry.verticesNeedUpdate = true;
		mesh.geometry.colorsNeedUpdate = true;
	});

})();