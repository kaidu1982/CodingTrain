<template>
    <div class="star-field">
        <canvas ref="mainCanvasRef" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;
const starArray: Star[] = [];
const width = 600;
const height = 600;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();
class Star {
    x: number;
    y: number;
    z: number;

    lastZ: number;

    constructor() {
        this.x = Math.random() * width - width * 0.5;
        this.y = Math.random() * height - height * 0.5;
        this.z = Math.random() * width;
        this.lastZ = this.z;
    }

    update() {
        this.z = this.z - 5;
        if (this.z < 1) {
            this.x = Math.random() * width * 0.1 - width * 0.5 * 0.1;
            this.y = Math.random() * height * 0.1 - height * 0.5 * 0.1;
            this.z = Math.random() * width;
            this.lastZ = this.z;
        }
    }

    show() {
        const sx = (this.x / this.z) * width;
        const sy = (this.y / this.z) * height;

        const lastX = (this.x / this.lastZ) * width;
        const lastY = (this.y / this.lastZ) * height;
        // const r = (this.z / width) * 5;
        // mainContext.fillStyle = '#ffffff';
        // mainContext.beginPath();
        // mainContext.arc(sx, sy, r, 0, Math.PI * 2);
        // mainContext.fill();

        mainContext.strokeStyle = '#ffffff';
        mainContext.beginPath();
        mainContext.moveTo(lastX, lastY);
        mainContext.lineTo(sx, sy);
        mainContext.stroke();

        this.lastZ = this.z;
    }
}

const addStar = () => {
    starArray.push(new Star());
};

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            mainContext.fillStyle = '#000000';
            mainContext.save();
            mainContext.fillRect(0, 0, width, height);

            mainContext.translate(width * 0.5, height * 0.5);
            starArray.forEach((star) => star.update());
            starArray.forEach((star) => star.show());
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

    Array(1000)
        .fill(0)
        .forEach(() => {
            addStar();
        });

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});
</script>
<style lang="scss" scoped>
.star-field {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
