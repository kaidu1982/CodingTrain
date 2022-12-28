<template>
    <div class="circle-packing">
        <canvas ref="mainCanvasRef" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';

const ani = ref();
const context = document.createElement('canvas').getContext('2d');
const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();

let lastTimestamp = 0;
let renderTime = 0;

const circles: Circle[] = [];
const bubbleDrawablePixel: Position[] = [];
const addCircle = () => {
    const { x, y } =
        bubbleDrawablePixel[
            Math.floor(Math.random() * bubbleDrawablePixel.length)
        ];
    if (!checkCollision(x, y)) circles.push(new Circle(x, y));
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

    const path = new Path2D();

    const mainContext: CanvasRenderingContext2D = (
        mainCanvasRef.value as HTMLCanvasElement
    ).getContext('2d') as CanvasRenderingContext2D;
    mainContext.fillStyle = '#000000';
    mainContext.fillRect(0, 0, canvasEl.clientWidth, canvasEl.clientHeight);

    mainContext.strokeStyle = '#eeeeee';
    circles.forEach((c: Circle) => {
        path.moveTo(c.x + c.r, c.y);
        path.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    });
    ``;
    mainContext.stroke(path);
};
const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (renderTime > 50) {
            Array(15)
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
    ani.value = requestAnimationFrame(draw);
};

onMounted(async () => {
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    canvasEl.width = devicePixelRatio * canvasEl.clientWidth;
    canvasEl.height = devicePixelRatio * canvasEl.clientHeight;

    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;

    const mainContext: CanvasRenderingContext2D = (
        mainCanvasRef.value as HTMLCanvasElement
    ).getContext('2d') as CanvasRenderingContext2D;

    mainContext.scale(devicePixelRatio, devicePixelRatio);

    if (context && bubbleDrawablePixel.length === 0) {
        context.canvas.width = canvasEl.width;
        context.canvas.height = canvasEl.height;

        context.fillStyle = '#000000';
        context.fillRect(0, 0, width, height);
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.font = 'bold 250px Noto Sans KR';
        context.fillText('HI', width * 0.5, 200);
        context.fillText('2023', width * 0.5, 450);

        const imageData = context.getImageData(0, 0, width, height);
        const pixels = new Uint8ClampedArray(imageData.data);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const pixelIndex = (x + y * width) * 4;
                const r = pixels[pixelIndex + 0];
                const g = pixels[pixelIndex + 1];
                const b = pixels[pixelIndex + 2];
                if (r > 200 && g > 200 && b > 200) {
                    bubbleDrawablePixel.push({ x, y });
                }
            }
        }
    }

    ani.value = requestAnimationFrame(draw);
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
    growable: boolean;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = 2;
        this.growable = true;
    }

    growIfGrowable() {
        if (this.growable) this.r++;
    }
}
</script>

<style lang="scss" scoped>
.circle-packing {
    display: flex;
    flex-direction: column;
    height: 100%;

    canvas {
        width: 800px;
        height: 600px;
    }
}
</style>
