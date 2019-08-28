import Utility from './utility';

class Artist {
	constructor(materialDef) {
		if (materialDef && materialDef.length) {
			materialDef = materialDef.map((definition) => {
				switch (definition.type) {
					case 'ocean': 
						return {
							key: definition.name,
							material: this.water()
						};
					default:
						return {
							key: definition.name,
							material: new THREE.MeshStandardMaterial({
								color: 0xFFFFFF,
								/*vertexColors: THREE.VertexColors,*/
								roughness: 1.0,
								flatShading: true,
								morphTargets: true
							})
						};
				}
			});
		}

		this.materials = materialDef;
	}

	get(key) {
		return this.materials.find((item) => {
			return item.key === key;
		});
	}

	water(){
		return new THREE.MeshLambertMaterial({color: 0x021d33, transparent: true, opacity: 0.85});
	}

	getDefaultMaterial() {
		return new THREE.MeshStandardMaterial({
			color: 0x9c9c9c,
			/*vertexColors: THREE.VertexColors,*/
			roughness: 1.0,
			flatShading: true,
			morphTargets: true
		});
	}

	setupDirectionalLight() {
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
		return directionalLight;
	}

	customIslandMaterial(boundingBox) {
		return new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.merge([
				THREE.UniformsLib[ "ambient" ],
				THREE.UniformsLib["lights"],
				{
					diffuseMaterial: { type: "c", value: new THREE.Color(1, 0, 0) },
					colorSea: {
						value: new THREE.Color(0x9b7952)
					},
					colorSand: {
						value: new THREE.Color(0xECBA82)
					},
					colorGrass: {
						value: new THREE.Color(0x297045)
					},
					colorRock: {
						value: new THREE.Color(0x313138)
					},
					colorSnow: {
						value: new THREE.Color(0xF9F8F8)
					},
					bboxMin: {
						value: boundingBox.min
					},
					bboxMax: {
						value: boundingBox.max
					},
					upAxis: {
						value: new THREE.Vector3(0, 0, 1)
					},
					morphTargetInfluences: {
						value: []
					}
				}
			]),
			vertexShader: `
				const float PI = 3.1415926535897932384626433832795;

				uniform vec3 bboxMin;
				uniform vec3 bboxMax;
				uniform vec3 upAxis;
				uniform vec3 diffuseMaterial;
				uniform vec3 ambientLight;
				uniform vec3 directionalLightColor[NUM_DIR_LIGHTS];
				uniform vec3 directionalLightDirection[NUM_DIR_LIGHTS];
				uniform vec3 ambientLightColor[1];

				varying vec2 vUv;
				varying float angle;
				varying highp vec3 vLighting;

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

					vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

					vUv.y = (transformed.z * 4.0) / bboxMax.y ;

					float lengthA = sqrt(objectNormal.x * objectNormal.x + objectNormal.y * objectNormal.y + objectNormal.z  * objectNormal.z);
					float lengthB = sqrt(upAxis.x * upAxis.x + upAxis.y * upAxis.y + upAxis.z  * upAxis.z);

					angle = acos(dot(objectNormal, upAxis) / (lengthA * lengthB)) * 180.0 / PI;
					
					gl_Position = projectionMatrix * mvPosition;

					vec3 ambientLight = vec3(0.5, 0.5, 0.5);
					vec3 directionalLightColor = vec3(1, 1, 1);
					vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

					float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
					vLighting = ambientLight + (directionalLightColor * directional);
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
			varying vec3 vLighting;
			

			vec4 color;

			  
			  void main() {
				color = vec4(colorSea, 1.0);

				if( vUv.y <= 0.005)
				{
					color = vec4(colorSea, 1.0);
				}
				else if( vUv.y > 0.005 && vUv.y <= 0.01)
				{
					color = vec4(mix(colorSand, colorSand, vUv.y), 1.0);
				}
				else if( vUv.y > 0.01 && vUv.y <= 0.1)
				{
					color = vec4(mix(colorSand, colorGrass, vUv.y), 1.0);
				}
				else if( vUv.y > 0.1 && vUv.y <= 0.5)
				{
					color = vec4(colorGrass, 1.0);
				}
				else if( vUv.y > 0.5)
				{
					color = vec4(colorRock, 1.0);
				}


				if (angle > 0.0 && angle < 20.0 && vUv.y > 0.005 && vUv.y < 0.2) {
					color = vec4(colorSand, 1.0);
				}

				if (angle >= 0.0 && angle < 50.0 && vUv.y > 0.1 && vUv.y < 0.3) {
					color = vec4(colorGrass, 1.0);
				}

				if (angle >= 30.0 && vUv.y > 0.05 && vUv.y < 0.8) {
					color = vec4(colorRock, 1.0);
				}

				if (angle <= 50.0 && vUv.y > 0.75) {
					color = vec4(mix(colorRock, colorSnow, vUv.y), 1.0);
				}

			

				gl_FragColor = color * vec4(vLighting, 1.0);
				  
			  }
			`,
			morphTargets: true,
			morphNormals: true,
			lights: true
		});
	}
}

export default Artist;