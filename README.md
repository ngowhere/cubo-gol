# Cuboctahedron Game of Life
This is the cuboctahedron displaying Conway's game of life. This project uses the Three.js typescript [boilerplate made by Sean Bradley](https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git). Visit the original boilerplate to learn more about this template. This project uses the **Dat.GUI* library to handle the slider controls. 

## Installing

1. Clone Repository

```bash
git clone https://github.com/ngowhere/cubo-gol.git
```

2. CD into folder

```bash
cd cubo-gol
```

3. Install TypeScript

```bash
npm install -g typescript
```

4. Install dependencies

```bash
npm install
```

5. Start it

```bash
npm run dev
```

6. Visit [http://127.0.0.1:8080](http://127.0.0.1:8080)

You should see a mass of gray and white spheres and be able to rotate around the scene with your mouse.

7. Edit project in VSCode

```bash
code .
```

## Branches

The boiler plate's default **master** branch does not include **Stats.js**, **Dat.GUI** or **Socket.IO**. Development is hosted on the main branch

### DAT.gui

To get a version of the boilerplate that includes the **Stats** and the **Dat.GUI** panels then,

```bash
git checkout statsgui
npm install
npm run dev
```

Visit [http://127.0.0.1:8080](http://127.0.0.1:8080)

![With Stats.js and Dat.GUI](docs/with-stats-gui.jpg)

