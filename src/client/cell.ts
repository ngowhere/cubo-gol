import * as THREE from 'three'
 
export class Cell{
    id: number;
    position: number[];
    neighbors: Set<any>;
    alive: boolean;
    sphere: THREE.Mesh;
    time: number;

    constructor(id: number, pos: number[]) {
      this.id = id;
      this.position = pos;
      this.neighbors = new Set();
      this.alive = false;
      this.time = 0;
  
      let mat = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8,
      });

      let cuboSphere = new THREE.SphereGeometry( 0.5, 15, 15);
  
      this.sphere = new THREE.Mesh(cuboSphere, mat);
      const [x, y, z] = this.position;
      this.sphere.position.set(x, y, z);
    //   scene.add(this.sphere);  
    }
}