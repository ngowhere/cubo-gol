import {Cell} from './cell'

export class Cuboctahedron{
    shells: number;
    body: Cell[];

    constructor(shells: number = 2, spacing: number = 1.5){
        const coords = this.generateCoordinates(shells, spacing);
        this.body = this.toCell(coords);
        this.shells = shells; 
    }
    
    generateCoordinates(n = 2, spacing = 2){
        let l = [];
        // Top 
        for (let z = 0; z < n+1; z++){
            l.push(...this.generateCuboctahedronLayer(z,n,spacing));
        }
        // Bottom
        for (let z = 1; z < n+1; z++){
            // l.push(...generateCuboctahedronLayer(z, n, spacing).map(i => flip(...i)));
            let newLayer = this.generateCuboctahedronLayer(z,n,spacing);
            let flippedArr = newLayer.map(this.flip);
            l.push(...flippedArr);
        }

        return l
    }
 
    // Converts arr of positions into Cell objects and sets neighbors of each cell 
    toCell(cubo: any[]): Cell[] {
        const cells: Cell[] = cubo.map((pos: number[], index: number) => new Cell(index, pos));
        cells.map((cell: Cell) => this.findNeighbors(cell, cells));
        return cells;
    }

    // Helper: Given z (the current layer number), n (the number of shells), and
    //spacing, this function generates the coordinates for the current layer of cubo
    private generateCuboctahedronLayer(z : number, n : number = 2, spacing : number = 2){
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

    // Helper: mirrors coordinates across y and z axis
    private flip(coords: number[]): number[] {
        const [x, y, z] = coords;
        return [x, -y, -z];
    }

    // Helper: Used to help find neighbors
    private distance(pos1 : number[], pos2 : number[]){
        const [x1, y1, z1] = pos1
        const [x2, y2, z2] = pos2

        let a = x1 - x2;
        let b = y1 - y2;
        let c = z1 - z2;
        
        return Math.sqrt(a * a + b * b + c * c);
    }

    // Helper: Given a current cell, find the cell's neighbors and append 
    // https://github.com/oguzeroglu/Nearby - Neighbor detection 
    private findNeighbors(cell: Cell, cubo: Cell[], spacing: number = 2): void {
        for (let i = 0; i < cubo.length; i++) {
        let other = cubo[i];
        let dist = this.distance(cell.position, other.position);
        // console.log(dist)
        if (dist <= spacing && dist > 0) {
            cell.neighbors.add(other.id);
        }
        }
    }

    // // Testing Only: Builds Cubo and validates coordinates and neightbots
    // builCuboTest(){
    //     var positions = this.generateCuboactahedronCoordinates(2, 2)
    //     positions.forEach(e => console.log(e));

    //     var cellCubo = this.toCell(positions)
    //     console.log(cellCubo)

    //     cellCubo.forEach(e => console.log(e.id, e.neighbors));
    //     // console.log(cellCubo)
    // }

    // // Testing Only: Shows coordinates of the each layer
    // showLayers (positions: number[][]): void{
    //     let layers: { [key: number]: number[][] } = {};

    //     for (let i = 0; i < positions.length; i++) {
    //         let p = positions[i];
    //         let currZ = p[2];
            
    //         if (currZ in layers) {
    //             layers[currZ].push(p);
    //         } else {
    //             layers[currZ] = [p];
    //         }
    //     }

    //     // Prints Layers
    //     for (let layer in layers) {
    //         console.log(`\nZ: ${layer} ${layers[layer].length}`);
    //         console.log(...layers[layer], "\n");
    //     }
    // }

}
