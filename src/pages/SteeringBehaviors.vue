<template>
    <div class="steering-behaviors">
        <canvas ref="mainCanvasRef" @mousemove="handleMouseMove" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { random } from '@/util/MathUtil';
import {
    createVector,
    dist,
    fromAngle,
    map,
    random2D,
    Vector2D,
} from '@/class/Vector';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

let lastMouseEvent: MouseEvent | null = null;
const handleMouseMove = (e: MouseEvent) => {
    lastMouseEvent = e;
};

const width = 800;
const height = 400;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let ballPoints: Vector2D[] = [];
let vehicles: Vehicle[] = [];

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;
    }

    mainContext.fillStyle = 'rgb(51, 51, 51)';
    mainContext.fillRect(0, 0, width, height);

    for (var i = 0; i < vehicles.length; i++) {
        var v = vehicles[i];
        v.behaviors();
        v.update();
        v.show();
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

    ballPoints = textToPoints();

    ballPoints.forEach((pt: Vector2D) => {
        const vehicle = new Vehicle(pt.x, pt.y);
        vehicles.push(vehicle);
    });

    console.log('ballPoints', ballPoints);

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

const textToPoints = () => {
    const points: Vector2D[] = [];

    const context: CanvasRenderingContext2D = document
        .createElement('canvas')
        .getContext('2d') as CanvasRenderingContext2D;

    context.canvas.width = 60;
    context.canvas.height = 30;

    context.fillStyle = 'rgb(0, 154, 253)';

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.font = '18px arial';
    context.fillText('TRAIN', 5, 16);

    const radius = 5;
    const data32 = new Uint32Array(
        context.getImageData(
            0,
            0,
            context.canvas.width,
            context.canvas.height
        ).data.buffer
    );

    console.log('data32.length', data32.length);
    for (let i = 0; i < data32.length; i++) {
        if (data32[i] & 0xff000000) {
            // check alpha mask
            const x = (i % context.canvas.width) * radius * 2 + radius; // use position and radius to;
            const y = ((i / context.canvas.height) | 0) * radius * 2 + radius; //  pre-calc final position and size});
            points.push(new Vector2D(x, y));
        }
    }

    mainContext.drawImage(context.canvas, 0, 0);

    return points;
};

class Vehicle {
    pos: Vector2D;
    target: Vector2D;
    vel: Vector2D;

    acc: Vector2D;

    r: number;
    maxspeed: number;

    maxforce: number;

    constructor(x: number, y: number) {
        this.pos = createVector(random(width), random(height));
        this.target = createVector(x, y);
        this.vel = random2D();
        this.acc = createVector();
        this.r = 8;
        this.maxspeed = 10;
        this.maxforce = 1;
    }

    behaviors() {
        if (lastMouseEvent) {
            const { offsetX, offsetY } = lastMouseEvent;

            const arrive = this.arrive(this.target);

            const mouse = createVector(offsetX, offsetY);
            const flee = this.flee(mouse);

            arrive.multiScale(1);
            flee.multiScale(5);

            this.applyForce(arrive);
            this.applyForce(flee);
        }
    }

    applyForce(f: Vector2D) {
        this.acc.add(f);
    }

    update() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.acc.multiScale(0);
    }

    show() {
        mainContext.strokeStyle = 'rgb(255, 255, 255)';
        mainContext.lineWidth = this.r;
        mainContext.beginPath();

        mainContext.arc(
            this.pos.x,
            this.pos.y,
            this.r / 2,
            0,
            Math.PI * 2,
            false
        );
        mainContext.stroke();
    }

    arrive(target: Vector2D) {
        const desired = target.copy();
        desired.sub(this.pos);

        var d = desired.mag();
        var speed = this.maxspeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxspeed);
        }
        desired.setMag(speed);
        const steer = desired.copy();
        steer.sub(this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    flee(target: Vector2D) {
        const desired = target.copy();
        desired.sub(this.pos);
        var d = desired.mag();
        if (d < 50) {
            desired.setMag(this.maxspeed);
            desired.multiScale(-1);
            const steer = desired.copy();
            steer.sub(this.vel);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }
}
</script>
<style lang="scss" scoped>
.steering-behaviors {
    display: flex;
    flex-direction: column;

    canvas {
        width: 800px;
        height: 400px;
    }
}
</style>
