export class Cell {
    i: number;
    j: number;
    x: number;
    y: number;
    w: number;
    neighborCount: number;
    bee: boolean;
    revealed: boolean;

    constructor(i: number, j: number, w: number) {
        this.i = i;
        this.j = j;
        this.x = i * w;
        this.y = j * w;
        this.w = w;
        this.neighborCount = 0;

        this.bee = false;
        this.revealed = false;
    }

    show() {}
}
