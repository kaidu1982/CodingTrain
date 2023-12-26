<template>
    <div class="self-avoiding-walk">
        <canvas ref="mainCanvasRef" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

const width = 600;
const height = 600;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let allOptions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
];

let x = 0;
let y = 0;

let grid: boolean[][] = [];
let spacing = 10;
let cols: number = 0;
let rows: number = 0;

const make2DArray = (cols: number, rows: number) => {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
};

function isValid(i: number, j: number) {
    if (i < 0 || i >= cols || j < 0 || j >= rows) {
        return false;
    }
    return !grid[i][j];
}

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            mainContext.fillStyle = '#ffffff';
            mainContext.lineWidth = spacing * 0.5;
            mainContext.beginPath();
            mainContext.arc(
                x * spacing,
                y * spacing,
                (spacing * 0.5) / 2,
                0,
                Math.PI * 2,
                false
            );
            mainContext.fill();

            let options = [];
            for (let option of allOptions) {
                let newX = x + option.dx;
                let newY = y + option.dy;
                if (isValid(newX, newY)) {
                    options.push(option);
                }
            }

            if (options.length > 0) {
                let step = options[Math.floor(Math.random() * options.length)];

                mainContext.lineWidth = 1;
                mainContext.strokeStyle = '#ffffff';

                mainContext.beginPath();

                mainContext.moveTo(x * spacing, y * spacing);

                x += step.dx;
                y += step.dy;
                mainContext.lineTo(x * spacing, y * spacing);
                mainContext.stroke();

                mainContext.closePath();
                grid[x][y] = true;
            } else {
                console.log(`I'm stuck!`);
                // noLoop();
            }

            // mainContext.fillStyle = '#000000';
            // mainContext.save();
            // mainContext.fillRect(0, 0, width, height);
            //
            // mainContext.translate(width * 0.5, height * 0.5);
            // starArray.forEach((star) => star.update());
            // starArray.forEach((star) => star.show());
            // mainContext.restore();
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
    mainContext.fillStyle = 'rgb(51, 51, 51)';
    mainContext.fillRect(0, 0, width, height);

    cols = Math.floor(width / spacing);
    rows = Math.floor(height / spacing);
    x = cols / 2;
    y = rows / 2;

    grid = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = false;
        }
    }
    grid[x][y] = true;

    console.log('grid', grid);

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});
</script>
<style lang="scss" scoped>
.self-avoiding-walk {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
