import * as THREE from 'three' 
import {Cell} from './cell'
import { Cuboctahedron } from './cuboctahedron' 

export class gameOfLife{
    private DEAD =  new THREE.Color( 0x454545 );
    private ALIVE = new THREE.Color( 0xffffff );
     LIFETIME = 10;

     lastUpdate = 0;
     UPDATE_INTERVAL = 1;

    cubo: Cuboctahedron;

    structure = {
        shells: 2,
        spacing: 1.5,
        radius: 10,
        start_seed: 15,
        scene_brightness: 90,
    }

    gameState = {
        clock: new THREE.Clock(),
        frame: 0,
        maxFrame: 90,
        fps: 30,
        per: 0
    };

    rules = {
        overpopulated: 3,
        birth: 3,
        underpopulated: 2,
        fade_out: 50, 
        fade_in: 50
    };

    constructor(){
        this.cubo  = new Cuboctahedron(this.structure.shells, this.structure.spacing);
        this.gameState.clock.start();
        this.setSeed()
        console.log("Creating game object...")
    }

    // gamingLoop(): void{
    //     console.log("loop")
    //     console.log(this.gameState)
    //     console.log(this.gameState.clock);
    //     const seconds = this.gameState.clock.getDelta();
    //     const totalSeconds = this.gameState.clock.getElapsedTime();
    //     // requestAnimationFrame( this.gameLoop );

    //     this.gameState.per = this.gameState.frame / this.gameState.maxFrame;
    //     this.gameState.frame += this.gameState.fps * seconds;
    //     this.gameState.frame %= this.gameState.maxFrame;
      
    //     const time = Math.round(totalSeconds);
        
    //     if (time - this.lastUpdate > this.UPDATE_INTERVAL){
    //       this.lastUpdate = time;
    //       this.playGame();
    //     }
    //     this.fade()
    //     // renderer.render(scene, camera);
    // }

    // turns dims and brightens the lights of the cuboctahedron
    fade(): void {
        for (let i = 0; i < this.cubo.body.length; i++) {
          if (this.cubo.body[i].time > 0){
            if (this.cubo.body[i].alive) {
              this.fadeIn(this.cubo.body[i])
            }else{
              this.fadeOut(this.cubo.body[i])
            }
          }
        }
    }

    playGame(): void {
        // newStatus is an array of booleans indicating who is alive
        let newStatus = this.cubo.body.map((cell) => {
          let count = this.checkNeighbors(cell);
          if (cell.alive) {
            if (count < this.rules.underpopulated || count > this.rules.overpopulated) {
              cell.time = cell.time > 0 ? cell.time : this.LIFETIME;
              return false;
            } else {
              return true;
            }
          } else {
            if (count == this.rules.birth){
              cell.time = cell.time > 0 ? cell.time : this.LIFETIME;
              return true
            }else{
              return false
            }
          }
        });
      
        // Update new status + colors of cubo
        for (let i = 0; i < this.cubo.body.length; i++) {
          this.cubo.body[i].alive = newStatus[i];
          if (this.cubo.body[i].alive) {
            // this.cubo.body[i].sphere.material.color.setHex(this.ALIVE.getHex());
            (this.cubo.body[i].sphere.material as THREE.MeshPhongMaterial).color.setHex(this.ALIVE.getHex());

          }else{
            // this.cubo.body[i].sphere.material.color.setHex(this.DEAD.getHex());
            (this.cubo.body[i].sphere.material as THREE.MeshPhongMaterial).color.setHex(this.DEAD.getHex());
          }
        }
    }

    // Choose random cells to start alive
    setSeed(): void {
        for (let i = 0; i < this.structure.start_seed; i++) {
          let index = Math.floor(Math.random() * this.cubo.body.length);
          this.cubo.body[index].alive = true;
        //   this.cubo.body[index].sphere.material.color.setHex(this.ALIVE);
          (this.cubo.body[index].sphere.material as THREE.MeshPhongMaterial).color.setHex(this.ALIVE.getHex());
        }
    }

    restartScene(): any{
        console.log("RESTARTING SCENE...")
        
        const newCoords = this.cubo.generateCoordinates(this.structure.shells, this.structure.spacing)
        console.log(newCoords)
      
        this.cubo.body.forEach((cell: Cell, index: number) => {
          cell.alive = false;
      
          console.log(cell.position)
          cell.position = newCoords[index];
          cell.time = 0;
      
          const [x, y, z] = cell.position;
          cell.sphere.position.set(x, y, z);
        });
      
        this.setSeed()
      
        const BLACK = new THREE.Color( 'black' );
      
        var newLight = new THREE.Color();
        newLight = newLight.lerpColors(BLACK, this.ALIVE, this.structure.scene_brightness/255);
        // light.color.setHex(newLight.getHex());
    }

    // Debugging function that displays the ids of all alive cells and their neighbors
    showAliveCells(): void {
        console.log("Currently Alive Cells: ");
        for (let i = 0; i < this.cubo.body.length; i++) {
          if (this.cubo.body[i].alive) {
            console.log(`Cell ${i} : ${this.showNeighbors(this.cubo.body[i])} :  ${Array.from(this.cubo.body[i].neighbors)}`);
          }
        }
    }

    // Helper: Fades the color of a cell
    private fadeOut(cell : Cell): void{
        var deathColor = new THREE.Color();
        deathColor = deathColor.lerpColors(this.DEAD, this.ALIVE, cell.time/this.LIFETIME);
        // cell.sphere.material.color.setHex(deathColor.getHex())
        (cell.sphere.material as THREE.MeshPhongMaterial).color.setHex(deathColor.getHex());

        cell.time -= this.rules.fade_out/1000;
    }
      
    // Helper: Brightens the color of a cell
    private fadeIn(cell : Cell): void{
        var birthColor = new THREE.Color();
        birthColor = birthColor.lerpColors(this.ALIVE, this.DEAD, cell.time/this.LIFETIME);
        // cell.sphere.material.color.setHex(birthColor.getHex())
        (cell.sphere.material as THREE.MeshPhongMaterial).color.setHex(birthColor.getHex());

        cell.time -= this.rules.fade_in/1000;
    }

    // Helper: Returns the number of alive neighbors a cell has
    private checkNeighbors(cell: Cell): number {
        let neighbors = Array.from(cell.neighbors);
        let result: number[] = [];
        for (let i = 0; i < neighbors.length; i++) {
            let testId = neighbors[i] as number;
            if (this.cubo.body[testId].alive) {
                result.push(neighbors[i] as number);
            }
        }
        return result.length;
    }

    // Helper: Debugging helper that returns stringified list of a cell's neighbors' ids
    private showNeighbors(cell: Cell): string {
        const neighbors = Array.from(cell.neighbors);
        const result = neighbors
          .filter(neighborId => this.cubo.body[neighborId].alive)
          .join(', ');
      
        return result;
    }

    
      

}