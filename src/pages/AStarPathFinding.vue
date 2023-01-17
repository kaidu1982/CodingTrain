<template>
    <div class="a-star-path-finding">
        <canvas ref="mainCanvasRef" />
    </div>
</template>

<script lang="ts" setup>
//http://www.gisdeveloper.co.kr/?p=3897
import { onMounted, onUnmounted, ref, Ref } from 'vue';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let w = 0;
let h = 0;

const cols = 50;
const rows = 50;
const grid: any[] = [];
let path: Spot[] = [];

const openSet: Spot[] = [];
const closedSet: Spot[] = [];

class Spot {
    i: number;
    j: number;
    f: number;
    g: number;
    h: number;

    neighbors: Spot[] = [];
    previous: Spot | undefined = undefined;
    wall = false;

    constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        if (Math.random() < 0.1) this.wall = true;
    }

    show(color: string) {
        mainContext.fillStyle = this.wall ? 'rgb(0, 0, 0)' : color;
        mainContext.beginPath();
        mainContext.rect(this.i * w, this.j * h, w - 1, h - 1);
        mainContext.fill();
    }

    addNeighbors() {
        if (this.i < cols - 1) this.neighbors.push(grid[this.i + 1][this.j]);
        if (this.i > 0) this.neighbors.push(grid[this.i - 1][this.j]);

        if (this.j < rows - 1) this.neighbors.push(grid[this.i][this.j + 1]);
        if (this.j > 0) this.neighbors.push(grid[this.i][this.j - 1]);

        // if (this.i > 0 && this.j > 0)
        //     this.neighbors.push(grid[this.i - 1][this.j - 1]);
        // if (this.i < cols - 1 && this.j > 0)
        //     this.neighbors.push(grid[this.i + 1][this.j - 1]);
        // if (this.i > 0 && this.j < rows - 1)
        //     this.neighbors.push(grid[this.i - 1][this.j + 1]);
        // if (this.i < cols - 1 && this.j < rows - 1)
        //     this.neighbors.push(grid[this.i + 1][this.j + 1]);
    }
}

let start: Spot | undefined;
let end: Spot | undefined;
let current: Spot | undefined;
const removeFromArray = (arr: Array<any>, elt: any) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === elt) {
            arr.splice(i, 1);
        }
    }
};

const heuristic = (a: Spot, b: Spot) => {
    // const d = dist(a.i, )
    const d = Math.sqrt((a.i - b.i) ** 2 + (a.j - b.j) ** 2);
    // const d = Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
    return d;
};
const draw = (timestamp: number) => {
    let done = false;
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        console.log('clear');
        mainContext.clearRect(
            0,
            0,
            mainContext.canvas.clientWidth,
            mainContext.canvas.clientHeight
        );

        if (openSet.length > 0) {
            let winner = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[winner].f) {
                    winner = i;
                }
            }

            current = openSet[winner];
            if (openSet[winner] === end) {
                console.log('done');
                done = true;
            }
            removeFromArray(openSet, current);
            closedSet.push(current);
            // console.log('closedSet current', current.i, current.j);

            const neighbors = current.neighbors;
            for (let i = 0; i < neighbors.length; i++) {
                const neighbor = neighbors[i];
                if (!closedSet.includes(neighbor) && !neighbor.wall) {
                    let tempG = current.g + 1;

                    let newPath = false;
                    if (openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    } else {
                        neighbor.g = tempG;
                        newPath = true;
                        openSet.push(neighbor);
                    }

                    if (newPath) {
                        neighbor.h = heuristic(neighbor, end as Spot);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = current;
                    }
                }
            }
        } else {
            console.error('no solution');
        }

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].show('rgb(255, 255, 255)');
            }
        }

        for (let i = 0; i < closedSet.length; i++) {
            closedSet[i].show('rgb(255, 0, 0)');
        }

        for (let i = 0; i < openSet.length; i++) {
            openSet[i].show('rgb(0, 255, 0)');
        }

        path = [];
        let temp: Spot = current as Spot;
        path.push(temp);

        while (temp.previous) {
            path.push(temp.previous);
            temp = temp.previous;
        }

        for (let i = 0; i < path.length; i++) {
            path[i].show('rgb(0,  0, 255)');
        }
    }
    lastTimestamp = timestamp;
    if (!done) ani.value = requestAnimationFrame(draw);
};

onMounted(() => {
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    canvasEl.width = devicePixelRatio * canvasEl.clientWidth;
    canvasEl.height = devicePixelRatio * canvasEl.clientHeight;

    mainContext = (mainCanvasRef.value as HTMLCanvasElement).getContext(
        '2d'
    ) as CanvasRenderingContext2D;

    mainContext.scale(devicePixelRatio, devicePixelRatio);

    w = canvasEl.clientWidth / cols;
    h = canvasEl.clientHeight / rows;

    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Spot(i, j);
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].addNeighbors();
        }
    }

    start = grid[0][0] as Spot;
    start.wall = false;

    end = grid[cols - 1][rows - 1] as Spot;
    end.wall = false;

    openSet.push(start);

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});
</script>

<style lang="scss" scoped>
.a-star-path-finding {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
