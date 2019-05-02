class Water{
	constructor(){
		this.reset();
	}

	reset(){
		this.position =  new THREE.Vector3(0,0,1000);
		this.velocity = new THREE.Vector3(0,0,0);
		this.volume = 1;
		this.sediment = 0;
	}
}

export default Water;