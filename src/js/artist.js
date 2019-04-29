import Utility from './utility';

class Artist {
	constructor(materialDef) {
		if (materialDef && materialDef.length) {
			materialDef = materialDef.map((definition) => {
				switch (definition.type) {
					default:
						return {
							key: definition.name,
							material: new THREE.MeshStandardMaterial({
								color: 0xFFFFFF,
								vertexColors: THREE.VertexColors,
								roughness: 1.0,
								flatShading: true,
								morphTargets: true
							})
						};
						break;
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
}

export default Artist;