import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

import {Cell} from './cell'
import { Cuboctahedron } from './cuboctahedron'

//================ Set Scene ================
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
//controls.addEventListener('change', render)

const light = new THREE.AmbientLight( 0x808080 ); // soft white light
scene.add( light );

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

var rules = {
	overpopulated: 3,
	birth: 3,
	underpopulated: 2,
  fade_out: 50, 
  fade_in: 50
};

const golRules = gui.addFolder("Game of Life Rules")
golRules.add(rules, "overpopulated").min(0).max(55).step(1);
golRules.add(rules, "underpopulated").min(0).max(55).step(1);
golRules.add(rules, "birth").min(0).max(55).step(1);
golRules.add(rules, "fade_out").min(0).max(1000).step(1)
golRules.add(rules, "fade_in").min(0).max(1000).step(1)
golRules.open()


var structure = {
  spacing: 1.5,
  radius: 10,
  start_seed: 15,
  scene_brightness: 90,
}

const golStructure = gui.addFolder("Cuboctahedron Structure + Environment")
golStructure.add(structure, "spacing").min(0).max(10).step(0.5)
golStructure.add(structure, "radius").min(0).max(10)
golStructure.add(structure, "start_seed").min(0).max(55).step(1)
golStructure.add(structure, "scene_brightness").min(0).max(255).step(1)

golStructure.open()


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
  for (let i = 0; i < structure.start_seed; i++) {
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

function setTime(currTime: number){
  if (currTime > 0){
    return currTime
  }else{
    return LIFETIME
  }
}

function playGame(cubo: any[]): void {
  // Array of booleans
  let newStatus = cubo.map((cell) => {
    let count = checkNeighbors(cell, cubo);
    if (cell.alive) {
      if (count < rules.underpopulated || count > rules.overpopulated) {
        cell.time = setTime(cell.time);
        return false;
      } else {
        return true;
      }
    } else {
      if (count == rules.birth){
        cell.time = setTime(cell.time);
        return true
      }else{
        return false
      }
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
  // statusReport(cubo);
}

function fade(cubo: any[]): void {
  for (let i = 0; i < cubo.length; i++) {
    if (cubo[i].time > 0){
      if (cubo[i].alive) {
        fadeIn(cubo[i])
      }else{
        fadeOut(cubo[i])
      }
    }
  }
}

function fadeOut(cell : any){
  var deathColor = new THREE.Color();
  deathColor = deathColor.lerpColors(DEAD, ALIVE, cell.time/LIFETIME);
  cell.sphere.material.color.setHex(deathColor.getHex())
  cell.time -= rules.fade_out/1000;
}

function fadeIn(cell : any){
  var birthColor = new THREE.Color();
  birthColor = birthColor.lerpColors(ALIVE, DEAD, cell.time/LIFETIME);
  cell.sphere.material.color.setHex(birthColor.getHex())
  cell.time -= rules.fade_in/1000;
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
  console.log("STARTING...")
  const start = cubo.generatePackedCuboctahedron(shells, structure.spacing);
  var cellCubo = cubo.toCell(start);
  setSeed(cellCubo);
  return cellCubo;
}

function restartScene(cubo: any, shells: number = 2): any{
  console.log("RESTARTING SCENE...")
  
  const newCoords = cubo.generatePackedCuboctahedron(shells, structure.spacing)
  console.log(newCoords)

  cubo.forEach((cell: Cell, index: number) => {
    cell.alive = false;

    console.log(cell.position)
    cell.position = newCoords[index];
    cell.time = 0;

    const [x, y, z] = cell.position;
    cell.sphere.position.set(x, y, z);
  });

  setSeed(cubo)

  const BLACK = new THREE.Color( 'black' );

  var newLight = new THREE.Color();
  newLight = newLight.lerpColors(BLACK, ALIVE, structure.scene_brightness/255);
  light.color.setHex(newLight.getHex());
}

let game = startScene(2);

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
  // console.log(time);

  renderer.render(scene, camera);
};
  
gameLoop();

// --- Restart Button -- 
const restartButton = document.getElementById('restartButton') as HTMLButtonElement | null;

if (restartButton) {
    restartButton.addEventListener('click', () => {
        restartScene(game);
    });
} else {
    console.error('Button element not found');
}

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
