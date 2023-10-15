import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

import {gameOfLife} from './gameOfLife'

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


// ========Game of Life========================================================
console.log("STARTING...")
let game = new gameOfLife();
game.cubo.body.forEach(cell => {scene.add(cell.sphere)})

// --- Build out scene -- 
console.log("Building scene...")
const restartButton = document.getElementById('restartButton') as HTMLButtonElement | null;
if (restartButton) {
    restartButton.addEventListener('click', () => {
        game.restartScene();
    });
} else {
    console.error('Button element not found');
}


const gui = new GUI()

const golRules = gui.addFolder("Game of Life Rules")
golRules.add(game.rules, "overpopulated").min(0).max(55).step(1);
golRules.add(game.rules, "underpopulated").min(0).max(55).step(1);
golRules.add(game.rules, "birth").min(0).max(55).step(1);
golRules.add(game.rules, "fade_out").min(0).max(1000).step(1)
golRules.add(game.rules, "fade_in").min(0).max(1000).step(1)
golRules.open()

const golStructure = gui.addFolder("Cuboctahedron Structure + Environment")
// golStructure.add(game.structure, "shells").min(1).max(10).step(1)
golStructure.add(game.structure, "spacing").min(0).max(10).step(0.5)
// golStructure.add(game.structure, "radius").min(0).max(10)
golStructure.add(game.structure, "start_seed").min(0).max(55).step(1)
golStructure.add(game.structure, "scene_brightness").min(0).max(255).step(1)
golStructure.open()


//--Animation Frames--- 
console.log("Playing game...")
let gameLoop = function(){
  const seconds = game.gameState.clock.getDelta();
  const totalSeconds = game.gameState.clock.getElapsedTime();
  requestAnimationFrame( gameLoop );

  game.gameState.per = game.gameState.frame / game.gameState.maxFrame;
  game.gameState.frame += game.gameState.fps * seconds;
  game.gameState.frame %= game.gameState.maxFrame;

  const time = Math.round(totalSeconds);
  
  if (time - game.lastUpdate > game.UPDATE_INTERVAL){
    game.lastUpdate = time;
    game.playGame();
  }
  game.fade()
  renderer.render(scene, camera);
}
// Shows stats info
function animate(): void {
    requestAnimationFrame(animate)

    stats.begin()
    stats.end()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

gameLoop();
animate()
