import Architect from './architect';
import Artist from './artist';
import Camera from './camera';
import ControlPanel from './control-panel';
import Controls from './controls';
import Erosion from './erosion';
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
	//let controlPanel = new ControlPanel('#ui-control-panel');
	let heightMap = new HeightMap(document.getElementById('noise-canvas'));
	let meshes = [];

	data.objects.forEach((item) => {
		let geometry = architect.get(item.geometry).geometry;
		geometry.computeBoundingBox();

		let material = artist.get(item.material).material;

		if (item.material === 'default' ) {
			//material = artist.getDefaultMaterial();
			material = artist.customIslandMaterial(geometry.boundingBox);
		}
		
		let mesh = new THREE.Mesh(geometry, material);

		mesh.receiveShadow = true;
		mesh.castShadow = true;
		scene.scene.add(mesh);
		meshes.push(mesh);

		//mesh.position.set(new THREE.Vector3(item.position.x, item.position.y, item.position.z));

		mesh.position.x = item.position.x;
		mesh.position.y = item.position.y;
		mesh.position.z = item.position.z;
		mesh.rotation.x = Utility.radians(-90);
		mesh.rotation.z = Utility.radians(-270);
	});


	controls.addEventListener('change', (update) => {
		//controlPanel.updateCameraPosition(update.position);
	});

	controls.addEventListener('change', (update) => {
		//controlPanel.updateCameraRotation(update.rotation);
	});

	var light = new THREE.AmbientLight(0x404040, 4); // soft white light
	scene.scene.add(light);

	var directionalLight = artist.setupDirectionalLight();
	scene.scene.add(directionalLight);

	let getColour = function (height) {
		let colour = 0xD7BC81;
		if (height < 1) {
			color = 0x819CD7;
		}

		return colour;
	}

	//controlPanel.updateProgress(0);
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

	//architect.paintVertexBufferLandscape(geometry);

	mesh.geometry = geometry;
	mesh.geometry.verticesNeedUpdate = true;
	mesh.geometry.morphAttributes.position = [];
	mesh.geometry.morphAttributes.normal = [];

	let morphIndex = 0;
	let generationInProgress = false;


	function generate(){
		if (!generationInProgress) {
			generationInProgress = true;
			geometry = mesh.geometry.clone();
			architect.clearHeights(geometry);

			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry = architect.applyHeightmap(geometry, heightMap);
			geometry.computeVertexNormals();
			geometry.computeFaceNormals();
			geometry.normalizeNormals();

			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.normal.needsUpdate = true;

			mesh.geometry.morphAttributes.normal[0] = new THREE.Float32BufferAttribute(geometry.attributes.normal.array, 3);
			mesh.geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(geometry.attributes.position.array, 3);
			mesh.updateMorphTargets();


			let generator = architect.AnimateFloat(0, 1, 1);

			let process = (generator) => {
				let progress = generator.next();

				mesh.morphTargetInfluences[0] = progress.value;

				if (!progress.done) {
					requestAnimationFrame(() => {
						process(generator);
					})
				}
				else {
					mesh.morphTargetInfluences[0] = 1;
					mesh.geometry.dispose();
					mesh.geometry = geometry;
					mesh.morphTargetInfluences[0] = 0;
					generationInProgress = false;
				}
			};
			process(generator);
		}
	}

	//document.getElementById('terrain-generate').addEventListener('click', generate);

	document.addEventListener('keypress', (event) => {
		if(event.keyCode === 32){
			generate();
		}
	});

})();
