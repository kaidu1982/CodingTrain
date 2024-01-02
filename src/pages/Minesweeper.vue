<template>
    <div class="minesweeper">
        <canvas ref="mainCanvasRef" @click="(e: MouseEvent) => mouseClick(e)" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { make2DArray } from '@/util/MathUtil';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

const width = 401;
const height = 401;
const w = 20;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let x = 0;
let y = 0;

let grid: Cell[][] = [];

let cols: number = 0;
let rows: number = 0;

let totalBees = 30;

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            mainContext.fillStyle = '#ffffff';
            for (var i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    grid[i][j].show();
                }
            }
        }
    }

    lastTimestamp = timestamp;
    ani.value = requestAnimationFrame(draw);
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

    cols = Math.floor(width / w);
    rows = Math.floor(height / w);

    grid = make2DArray(cols, rows);
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j, w);
        }
    }
    // Pick totalBees spots
    var options = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            options.push([i, j]);
        }
    }

    for (var n = 0; n < totalBees; n++) {
        var index = Math.floor(Math.random() * options.length);
        var choice = options[index];
        var i = choice[0];
        var j = choice[1];
        // Deletes that spot so it's no longer an option
        options.splice(index, 1);
        grid[i][j].bee = true;
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].countBees();
        }
    }
    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

const gameOver = () => {
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].revealed = true;
        }
    }
};

const mouseClick = (e: MouseEvent) => {
    const { offsetX, offsetY } = e;

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (grid[i][j].contains(offsetX, offsetY)) {
                grid[i][j].reveal();

                if (grid[i][j].bee) {
                    gameOver();
                }
            }
        }
    }
};

class Cell {
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

    show() {
        mainContext.strokeStyle = 'rgb(0, 0, 0)';
        mainContext.strokeRect(this.x, this.y, this.w, this.w);
        if (this.revealed) {
            if (this.bee) {
                mainContext.fillStyle = 'rgb(127, 127,127)';
                mainContext.beginPath();
                mainContext.arc(
                    this.x + this.w * 0.5,
                    this.y + this.w * 0.5,
                    this.w * 0.25,
                    0,
                    Math.PI * 2
                );
                mainContext.fill();
            } else {
                mainContext.fillStyle = 'rgb(200, 200, 200)';
                mainContext.beginPath();
                mainContext.rect(this.x, this.y, this.w, this.w);
                if (this.neighborCount > 0) {
                    mainContext.textAlign = 'center';
                    mainContext.fillStyle = 'rgb(0, 0, 0)';
                    mainContext.fillText(
                        String(this.neighborCount),
                        this.x + this.w * 0.5,
                        this.y + this.w - 6
                    );
                }
            }
        }
    }

    countBees() {
        if (this.bee) {
            this.neighborCount = -1;
            return;
        }
        var total = 0;
        for (var xoff = -1; xoff <= 1; xoff++) {
            var i = this.i + xoff;
            if (i < 0 || i >= cols) continue;

            for (var yoff = -1; yoff <= 1; yoff++) {
                var j = this.j + yoff;
                if (j < 0 || j >= rows) continue;

                var neighbor = grid[i][j];
                if (neighbor.bee) {
                    total++;
                }
            }
        }
        this.neighborCount = total;
    }

    contains(x: number, y: number) {
        return (
            x > this.x &&
            x < this.x + this.w &&
            y > this.y &&
            y < this.y + this.w
        );
    }

    reveal() {
        this.revealed = true;
        if (this.neighborCount == 0) {
            // flood fill time
            this.floodFill();
        }
    }
    floodFill() {
        for (var xoff = -1; xoff <= 1; xoff++) {
            var i = this.i + xoff;
            if (i < 0 || i >= cols) continue;

            for (var yoff = -1; yoff <= 1; yoff++) {
                var j = this.j + yoff;
                if (j < 0 || j >= rows) continue;

                var neighbor = grid[i][j];
                // Note the neighbor.bee check was not required.
                // See issue #184
                if (!neighbor.revealed) {
                    neighbor.reveal();
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.minesweeper {
    display: flex;
    flex-direction: column;

    canvas {
        width: 401px;
        height: 401px;
    }
}
</style>
