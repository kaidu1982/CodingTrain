<template>
    <div class="quicksort">
        <canvas ref="mainCanvasRef" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { random } from '@/util/MathUtil';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

const width = 600;
const height = 600;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let values: number[] = [];
let w = 10;

let states: number[] = [];

const swap = async (arr: number[], a: number, b: number) => {
    await sleep(50);
    let temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
};

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const quickSort = async (arr: number[], start: number, end: number) => {
    if (start >= end) {
        return;
    }
    let index = await partition(arr, start, end);
    states[index] = -1;

    await Promise.all([
        quickSort(arr, start, index - 1),
        quickSort(arr, index + 1, end),
    ]);
};

const partition = async (arr: number[], start: number, end: number) => {
    for (let i = start; i < end; i++) {
        states[i] = 1;
    }

    let pivotValue = arr[end];
    let pivotIndex = start;
    states[pivotIndex] = 0;
    for (let i = start; i < end; i++) {
        if (arr[i] < pivotValue) {
            await swap(arr, i, pivotIndex);
            states[pivotIndex] = -1;
            pivotIndex++;
            states[pivotIndex] = 0;
        }
    }
    await swap(arr, pivotIndex, end);

    for (let i = start; i < end; i++) {
        if (i != pivotIndex) {
            states[i] = -1;
        }
    }

    return pivotIndex;
};

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            mainContext.fillStyle = '#000000';
            mainContext.save();
            mainContext.fillRect(0, 0, width, height);

            for (let i = 0; i < values.length; i++) {
                if (states[i] == 0) {
                    mainContext.fillStyle = '#E0777D';
                } else if (states[i] == 1) {
                    mainContext.fillStyle = '#D6FFB7';
                } else {
                    mainContext.fillStyle = '#ffffff';
                }
                mainContext.fillRect(i * w, height - values[i], w, values[i]);
            }
            mainContext.restore();
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

    values = new Array(Math.floor(width / w));
    for (let i = 0; i < values.length; i++) {
        values[i] = random(height);
        states[i] = -1;
    }
    quickSort(values, 0, values.length - 1);

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});
</script>
<style lang="scss" scoped>
.quicksort {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
