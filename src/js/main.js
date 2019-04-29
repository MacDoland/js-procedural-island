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
		geometry.computeBoundingBox();


		let material = new THREE.ShaderMaterial({
			uniforms: {
				colorSea: {
					value: new THREE.Color(0x4667A4)
				},
				colorSand: {
					value: new THREE.Color(0xD7BC81)
				},
				colorGrass: {
					value: new THREE.Color(0x6CA469)
				},
				colorRock: {
					value: new THREE.Color(0x9C9C9C)
				},
				colorSnow: {
					value: new THREE.Color(0xFFFFFF)
				},
				bboxMin: {
					value: geometry.boundingBox.min
				},
				bboxMax: {
					value: geometry.boundingBox.max
				},
				upAxis: {
					value: new THREE.Vector3(0, 0, 1)
				},
				morphTargetInfluences: {
					value: []
				}
			},
			vertexShader: `
			  uniform vec3 bboxMin;
			  uniform vec3 bboxMax;
			  uniform vec3 upAxis;
			  const float PI = 3.1415926535897932384626433832795;


	
				#ifdef USE_MORPHTARGETS
					#ifndef USE_MORPHNORMALS
						uniform float morphTargetInfluences[ 8 ];
					#else
						uniform float morphTargetInfluences[ 4 ];
					#endif
				#endif

				#ifdef USE_SHADOWMAP
					#if 1 > 0
						uniform mat4 directionalShadowMatrix[ 1 ];
						varying vec4 vDirectionalShadowCoord[ 1 ];
					#endif
					#if 0 > 0
						uniform mat4 spotShadowMatrix[ 0 ];
						varying vec4 vSpotShadowCoord[ 0 ];
					#endif
					#if 1 > 0
						uniform mat4 pointShadowMatrix[ 1 ];
						varying vec4 vPointShadowCoord[ 1 ];
					#endif
					#if 0 > 0
					#endif
				#endif

			
			  varying vec2 vUv;
			  varying float angle;
		  
			  void main() {

				vec3 objectNormal = vec3( normal );
				vec3 transformed = vec3( position );

				#ifdef USE_MORPHNORMALS
					objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
					objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
					objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
					objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
				#endif

				#ifdef USE_MORPHTARGETS
					transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
					transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
					transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
					transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
					#ifndef USE_MORPHNORMALS
						transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
						transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
						transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
						transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
					#endif
				#endif

				
				vec3 transformedNormal = normalMatrix * objectNormal;

				#ifndef FLAT_SHADED
					vNormal = normalize( transformedNormal );
				#endif

				
				vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

				vUv.y = (transformed.z * 4.0) / bboxMax.y ;

				float lengthA = sqrt(objectNormal.x * objectNormal.x + objectNormal.y * objectNormal.y + objectNormal.z  * objectNormal.z);
				float lengthB = sqrt(upAxis.x * upAxis.x + upAxis.y * upAxis.y + upAxis.z  * upAxis.z);

				angle = acos(dot(objectNormal, upAxis) / (lengthA * lengthB)) * 180.0 / PI;
				
				gl_Position = projectionMatrix * mvPosition;
			  }
			`,
			fragmentShader: `
			  uniform vec3 colorSea;
			  uniform vec3 colorSand;
			  uniform vec3 colorGrass;
			  uniform vec3 colorRock;
			  uniform vec3 colorSnow;
			
			  varying vec2 vUv;
			  varying float angle;
			  
			  void main() {
				if( vUv.y <= 0.005)
				{
					gl_FragColor = vec4(colorSea, 1.0);
				}
				else if( vUv.y > 0.005 && vUv.y <= 0.05)
				{
					gl_FragColor = vec4(mix(colorSand, colorSand, vUv.y), 1.0);
				}
				else if( vUv.y > 0.05 && vUv.y <= 0.1)
				{
					gl_FragColor = vec4(mix(colorSand, colorGrass, vUv.y), 1.0);
				}
				else if( vUv.y > 0.1 && vUv.y <= 0.4)
				{
					gl_FragColor = vec4(colorGrass, 1.0);
				}
				else if( vUv.y > 0.4 && vUv.y <= 0.9)
				{
					gl_FragColor = vec4(colorRock, 1.0);
				}
				else {
					gl_FragColor = vec4(colorSnow, 1.0);
				}

				if(angle > 40.0){
				//	gl_FragColor = vec4(colorRock, 1.0);
				}
				  
			  }
			`,
			flatShading: true,
			morphTargets: true,
			morphNormals: true
		});

		//material = artist.get(item.material).material;

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

	//architect.paintVertexBufferLandscape(geometry);

	mesh.geometry = geometry;
	mesh.geometry.verticesNeedUpdate = true;
	mesh.geometry.morphAttributes.position = [];
	mesh.geometry.morphAttributes.normal = [];

	let morphIndex = 0;
	let generationInProgress = false;
	document.getElementById('terrain-generate').addEventListener('click', function () {
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

			mesh.geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(geometry.attributes.position.array, 3);
			mesh.geometry.morphAttributes.normal[0] = new THREE.Float32BufferAttribute(geometry.attributes.normal.array, 3);
			mesh.updateMorphTargets();

			let generator = architect.AnimateFloat(0, 1, 0.5);

			let process = (generator) => {
				let progress = generator.next();

				mesh.morphTargetInfluences[0] = progress.value;

				if (!progress.done) {
					requestAnimationFrame(() => {
						process(generator);
					})
				}
				else {
					mesh.geometry.dispose();
					mesh.geometry = geometry;
					generationInProgress = false;
				}
			};

			process(generator);

			//slider.addEventListener('change', onMorph);
			//slider.addEventListener('input', onMorph);
		}
	});

})();