<template>
    <div class="circle-packing">
        <img src="/etc/imjinkang.jpeg" />
        <canvas ref="mainCanvasRef" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { loadImage } from '@/components/util';

const ani = ref();

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();

let lastTimestamp = 0;
let renderTime = 0;

let bgImage: undefined | CanvasRenderingContext2D;

const circles: Circle[] = [];

const addCircle = () => {
    if (bgImage) {
        const x = Math.floor(Math.random() * bgImage.canvas.width);
        const y = Math.floor(Math.random() * bgImage.canvas.height);

        const p = bgImage.getImageData(x, y, 1, 1).data;

        const color = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
        if (!checkCollision(x, y)) circles.push(new Circle(x, y, color));
    }
};
const checkCollision = (x: number, y: number) => {
    const collision = circles.find((c: Circle) => {
        const dist = Math.pow(
            Math.pow(c.x - x, 2) + Math.pow(c.y - y, 2),
            1 / 2
        );
        if (dist < c.r) {
            return c;
        }
    });
    return !!collision;
};

const growAllCircles = () => {
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;

    const growableCircles = circles.filter((c: Circle) => c.growable);
    growableCircles.forEach((c: Circle, index: number) => {
        if (
            c.x <= c.r ||
            c.y <= c.r ||
            canvasEl.clientWidth - c.x <= c.r ||
            canvasEl.clientHeight - c.y <= c.r
        ) {
            c.growable = false;
        } else {
            circles.forEach((other: Circle) => {
                if (c.x === other.x && c.y === other.y) {
                    return;
                }
                const dist = Math.pow(
                    Math.pow(c.x - other.x, 2) + Math.pow(c.y - other.y, 2),
                    1 / 2
                );
                if (dist < c.r + other.r) {
                    c.growable = false;
                    return false;
                }
            });
        }
        c.growIfGrowable();
    });
};
const drawAllCircles = () => {
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;

    const mainContext: CanvasRenderingContext2D = (
        mainCanvasRef.value as HTMLCanvasElement
    ).getContext('2d') as CanvasRenderingContext2D;
    mainContext.fillStyle = '#000000';
    mainContext.fillRect(0, 0, canvasEl.clientWidth, canvasEl.clientHeight);

    circles.forEach((c: Circle) => {
        mainContext.strokeStyle = c.color;
        const path = new Path2D();
        path.moveTo(c.x + c.r, c.y);
        path.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        mainContext.stroke(path);
    });
};
const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            Array(100)
                .fill(0)
                .forEach(() => {
                    addCircle();
                });

            renderTime -= 50;
            growAllCircles();
            drawAllCircles();
        }
    }

    lastTimestamp = timestamp;
    if (circles.length < 30000) ani.value = requestAnimationFrame(draw);
};
const changeKeyword = () => {
    cancelAnimationFrame(ani.value);
    ani.value = requestAnimationFrame(draw);
};
onMounted(async () => {
    bgImage = await loadImage();
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;

    const devicePixelRatio = window.devicePixelRatio ?? 1;
    canvasEl.width = devicePixelRatio * canvasEl.clientWidth;
    canvasEl.height = devicePixelRatio * canvasEl.clientHeight;

    const mainContext: CanvasRenderingContext2D = (
        mainCanvasRef.value as HTMLCanvasElement
    ).getContext('2d') as CanvasRenderingContext2D;

    mainContext.scale(devicePixelRatio, devicePixelRatio);

    changeKeyword();
});

onUnmounted(() => {
    console.log('onUnmounted');

    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

interface Position {
    x: number;
    y: number;
}

class Circle {
    x: number;
    y: number;
    r: number;
    color: string;
    growable: boolean;
    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.r = 2;
        this.color = color;
        this.growable = true;
    }

    growIfGrowable() {
        if (this.growable) this.r++;
    }
}
</script>

<style lang="scss" scoped>
.circle-packing {
    img {
        width: 600px;
        height: 450px;
    }
    canvas {
        margin-left: 20px;
        width: 600px;
        height: 450px;
    }
}
</style>
