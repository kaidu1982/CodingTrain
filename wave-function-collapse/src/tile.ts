const reverseString = (s: string) => {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

const compareEdge = (a: string, b: string) => {
  return a === reverseString(b);
}

export class Tile {
  img: HTMLImageElement | HTMLCanvasElement;
  edges: string[]
  up: number[]
  right: number[]
  down: number[]
  left: number[]

  index : undefined | number

  constructor(img: HTMLImageElement | HTMLCanvasElement, edges: string[], i: undefined | number = undefined) {
    this.img = img;
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];


    if (i !== undefined) {
      this.index = i;
    }
  }

  analyze(tiles: Tile[]) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // Tile 5 can't match itself
      if (tile.index === 5 && this.index === 5) continue;

      // UP
      if (compareEdge(tile.edges[2], this.edges[0])) {
        this.up.push(i);
      }
      // RIGHT
      if (compareEdge(tile.edges[3], this.edges[1])) {
        this.right.push(i);
      }
      // DOWN
      if (compareEdge(tile.edges[0], this.edges[2])) {
        this.down.push(i);
      }
      // LEFT
      if (compareEdge(tile.edges[1], this.edges[3])) {
        this.left.push(i);
      }
    }
  }

  rotate(num: number) {
    const w = this.img.width;
    const h = this.img.height;

    const newCanvas: HTMLCanvasElement = document.createElement('canvas');
    newCanvas.width = w;
    newCanvas.height = h;
    let newContext2D: CanvasRenderingContext2D | null;
    if(!(newContext2D = newCanvas.getContext( '2d'))) {
      throw new Error('2d context not support')
    }

    newContext2D.translate(w * 0.5, h * 0.5);
    newContext2D.rotate(Math.PI * 0.5);
    newContext2D.drawImage(this.img, 0, 0);




    const newEdges = [];
    const len = this.edges.length;
    for (let i = 0; i < len; i++) {
      newEdges[i] = this.edges[(i - num + len) % len];
    }
    return new Tile(newCanvas, newEdges, this.index);
  }
}
