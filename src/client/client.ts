import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
//controls.addEventListener('change', render)

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const light = new THREE.AmbientLight( 0x808080 ); // soft white light
scene.add( light );

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()

// const cubeFolder = gui.addFolder('Cube')
// cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
// cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
// cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
// cubeFolder.open()

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()


var rules = {
	overpopulated: 3,
	birth: 3,
	underpopulated: 2,
  decay: 20, 
};

const golRules = gui.addFolder("Game of Life Rules")
golRules.add(rules, "overpopulated").min(0).max(55).step(1);
golRules.add(rules, "underpopulated").min(0).max(55).step(1);
golRules.add(rules, "birth").min(0).max(55).step(1);
golRules.add(rules, "decay").min(0).max(1000).step(1)
golRules.open()

// ================= Build Cubo ===================================================
const cuboSphere = new THREE.SphereGeometry( 0.5, 15, 15);
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

function generatePackedCuboctahedron(n = 2, spacing = 2){
    let l = [];
    // Top 
    for (let z = 0; z < n+1; z++){
        l.push(...generateCuboctahedronLayer(z,n,spacing));
    }
    // Bottom
    for (let z = 1; z < n+1; z++){
        // l.push(...generateCuboctahedronLayer(z, n, spacing).map(i => flip(...i)));
        let newLayer = generateCuboctahedronLayer(z,n,spacing);
        let flippedArr = newLayer.map(flip);
        l.push(...flippedArr);
    }
    return l
}

// Helper: makes layer of cubo
function generateCuboctahedronLayer(z : number, n : number = 2, spacing : number = 2){
    let temp = []

    const vec1 = [1,   0,         0]
    const vec2 = [1/2, Math.sqrt(3)/2, 0]
    const vec3 = [1/2, -Math.sqrt(3)/6, Math.sqrt(6)/3]

    for (let y = -(n-z); y < n+1; y++){

        let start = 0
        let end  = 0

        // start = 0 ? y > 0 : -y
    
        if (y >0) {
            start = 0
            end  = 2*n+1-z-y
        }else{
            start = -y
            end  = 2*n+1-z
        }


        // let end  = 2*n+1-z-(y ? y > 0 : 0)
        // console.log("\t", start, end, end-start)
        
        for (let x = start; x < end; x++){

            let xPos = spacing*((x*vec1[0] + y*vec2[0] + z*vec3[0]) - n)
            let yPos = spacing*(x*vec1[1] + y*vec2[1] + z*vec3[1])
            let zPos = spacing*(x*vec1[2] + y*vec2[2] + z*vec3[2])

            temp.push([xPos,yPos,zPos])

        } 
    }
    return temp
}

// Helper:mirrors coordinates across y and z axis
function flip(coords: number[]): number[] {
    const [x, y, z] = coords;
    return [x, -y, -z];
}

// Creates Cell Object
class Cell {
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
        color: 0xFF0000,
        transparent: true,
        opacity: 0.8,
      });
  
      this.sphere = new THREE.Mesh(cuboSphere, mat);
      const [x, y, z] = this.position;
      this.sphere.position.set(x, y, z);
  
      scene.add(this.sphere);
    }
  }

// Helper: Used to help find neighbors
function distance(pos1 : number[], pos2 : number[]){
    const [x1, y1, z1] = pos1
    const [x2, y2, z2] = pos2

    let a = x1 - x2;
    let b = y1 - y2;
    let c = z1 - z2;
    
    return Math.sqrt(a * a + b * b + c * c);
}

// Converts arr of positions into Cell objects and sets neighbors of each cell 
function toCell(cubo: any[]): Cell[] {
    const cells: Cell[] = cubo.map((pos: number[], index: number) => new Cell(index, pos));
    cells.map((cell: Cell) => findNeighbors(cell, cells));
    return cells;
}

// https://github.com/oguzeroglu/Nearby - Neighbor detection 
// Floating point error - give room for error
function findNeighbors(cell: Cell, cubo: Cell[], spacing: number = 2): void {
    for (let i = 0; i < cubo.length; i++) {
      let other = cubo[i];
      let dist = distance(cell.position, other.position);
      // console.log(dist)
      if (dist <= spacing && dist > 0) {
        cell.neighbors.add(other.id);
      }
    }
}

function makeLayers (positions: number[][]): void{
    let layers: { [key: number]: number[][] } = {};

    for (let i = 0; i < positions.length; i++) {
      let p = positions[i];
      let currZ = p[2];
    
      if (currZ in layers) {
        layers[currZ].push(p);
      } else {
        layers[currZ] = [p];
      }
    }

    // Prints Layers
    for (let layer in layers) {
        console.log(`\nZ: ${layer} ${layers[layer].length}`);
        console.log(...layers[layer], "\n");
    }
}

// Testing Function that builds Cubo and validates coordinates
function builCuboTest(){
    var positions = generatePackedCuboctahedron(2, 2)
    positions.forEach(e => console.log(e));

    var cellCubo = toCell(positions)
    console.log(cellCubo)

    cellCubo.forEach(e => console.log(e.id, e.neighbors));
    // console.log(cellCubo)
}

// ========Game of Life========================================================

const DEAD =  new THREE.Color( 0x454545 );
const ALIVE = new THREE.Color( 0xffffff );

const LIFETIME = 10;

// Returns the number of alive neighbors a cell has
function checkNeighbors(cell: any, cubo: any[]): number {
    let neighbors = Array.from(cell.neighbors);
    let result: number[] = [];
    for (let i = 0; i < neighbors.length; i++) {
      let testId = neighbors[i] as number;
      if (cubo[testId].alive) {
        result.push(neighbors[i] as number);
      }
    }
    return result.length;
  }

function showNeighbors(cell: any, cubo: any[]): string {
  let neighbors = Array.from(cell.neighbors);
  let result: number[] = [];
  for (let i = 0; i < neighbors.length; i++) {
    let testId = neighbors[i] as number;
    if (cubo[testId].alive) {
      result.push(neighbors[i] as number);
    }
  }
  return result.toString();
}

// Choose random cells to start alive
function setSeed(cubo: any[]): void {
  for (let i = 0; i < 15; i++) {
    let index = Math.floor(Math.random() * cubo.length);
    cubo[index].alive = true;
    cubo[index].sphere.material.color.setHex(ALIVE);
  }
}

function updateCubo(cubo: any[], newStatus: boolean[]): void {
  for (let i = 0; i < cubo.length; i++) {
    cubo[i].alive = newStatus[i];
    if (cubo[i].alive) {
      cubo[i].sphere.material.color.setHex(0xFFC0CB);
    } else {
      cubo[i].sphere.material.color.setHex(0xFF0000);
    }
  }
}

function playGame(cubo: any[]): void {
  // Array of booleans
  let newStatus = cubo.map((cell) => {
    let count = checkNeighbors(cell, cubo);
    if (cell.alive) {
      if (count < rules.underpopulated) {
        cell.time = LIFETIME;
        return false;
      } else if (count > rules.overpopulated) {
        cell.time = LIFETIME;
        return false;
      } else {
        return true;
      }
    } else {
      return count == rules.birth;
    }
  });

  // Update new status + colors of cubo
  for (let i = 0; i < cubo.length; i++) {
    cubo[i].alive = newStatus[i];
    if (cubo[i].alive) {
      cubo[i].sphere.material.color.setHex(ALIVE.getHex());
    }else{
      cubo[i].sphere.material.color.setHex(DEAD.getHex());
    }
  }
  statusReport(cubo);
}

function fade(cubo: any[]): void {
  for (let i = 0; i < cubo.length; i++) {
    if (cubo[i].alive == false && cubo[i].time > 0) {
      deathFade(cubo[i])
    }
  }
}

function deathFade(cell : any){
  var deathColor = new THREE.Color();
  let orange = new THREE.Color("orange");
  deathColor = deathColor.lerpColors(DEAD, ALIVE, cell.time/LIFETIME);
  cell.sphere.material.color.setHex(deathColor.getHex())
  cell.time -= rules.decay/1000;
}

function statusReport(cubo: any[]): void {
  console.log("STATUS REPORT");
  for (let i = 0; i < cubo.length; i++) {
    if (cubo[i].alive) {
      console.log(`Cell ${i} : ${showNeighbors(cubo[i], cubo)} :  ${Array.from(cubo[i].neighbors)}`);
    }
  }
}

function startScene(shells: number = 2): any {
  var start = generatePackedCuboctahedron(shells);
  var cellCubo = toCell(start);
  setSeed(cellCubo);
  return cellCubo;
}

let game = startScene(2);

let start = game.map((cell: any) => cell.alive);
console.log(start);

const gameState = {
    clock: new THREE.Clock(),
    frame: 0,
    maxFrame: 90,
    fps: 30,
    per: 0
  };
  
gameState.clock.start();
let lastUpdate = 0;
const UPDATE_INTERVAL = 1;
   
  const gameLoop = function () {
    const seconds = gameState.clock.getDelta();
    const totalSeconds = gameState.clock.getElapsedTime();
    requestAnimationFrame(gameLoop);
    gameState.per = gameState.frame / gameState.maxFrame;
    gameState.frame += gameState.fps * seconds;
    gameState.frame %= gameState.maxFrame;
  
    const time = Math.round(totalSeconds);
    
    if (time - lastUpdate > UPDATE_INTERVAL){
      lastUpdate = time;
      playGame(game);
    }
    fade(game)
    console.log(time);
  
    renderer.render(scene, camera);
  };
  
gameLoop();

// ====================================================



function animate(): void {
    requestAnimationFrame(animate)

    stats.begin()
    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01
    stats.end()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
//render()
