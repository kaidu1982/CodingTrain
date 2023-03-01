<template>
    <div class="ray-casting-2d">
        <canvas ref="mainCanvasRef" @mousemove="handleMouseMove" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { random } from '@/util/MathUtil';
import { createVector, dist, fromAngle, Vector2D } from '@/class/Vector';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

const width = 600;
const height = 600;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let walls: Boundary[] = [];
let ray;
let particle: Particle;
let xoff = 0;
let yoff = 10000;

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

let lastMouseEvent: MouseEvent | null = null;
const handleMouseMove = (e: MouseEvent) => {
    lastMouseEvent = e;
};
const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (lastMouseEvent !== null) {
            mainContext.fillStyle = '#000000';
            mainContext.fillRect(0, 0, width, height);

            for (let wall of walls) {
                wall.show();
            }

            const { offsetX, offsetY } = lastMouseEvent;

            particle.update(offsetX, offsetY);
            particle.show();
            particle.look(walls);

            xoff += 0.01;
            yoff += 0.01;
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

    particle = new Particle();

    for (let i = 0; i < 5; i++) {
        let x1 = random(width);
        let x2 = random(width);
        let y1 = random(height);
        let y2 = random(height);
        walls[i] = new Boundary(x1, y1, x2, y2);
    }
    walls.push(new Boundary(-1, -1, width, -1));
    walls.push(new Boundary(width, -1, width, height));
    walls.push(new Boundary(width, height, -1, height));
    walls.push(new Boundary(-1, height, -1, -1));

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

class Boundary {
    a: Vector2D;
    b: Vector2D;
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
    }

    show() {
        mainContext.strokeStyle = 'rgb(255, 255, 255)';
        mainContext.beginPath();
        mainContext.moveTo(this.a.x, this.a.y);
        mainContext.lineTo(this.b.x, this.b.y);
        mainContext.stroke();
    }
}

class Ray {
    pos: Vector2D;
    dir: Vector2D;

    constructor(pos: Vector2D, angle: number) {
        this.pos = pos;
        this.dir = fromAngle(angle);
    }

    lookAt(x: number, y: number) {
        this.dir.x = x - this.pos.x;
        this.dir.y = y - this.pos.y;
        this.dir.normalize();
    }

    show() {
        mainContext.strokeStyle = 'rgb(255, 255, 255)';
        mainContext.save();
        mainContext.translate(this.pos.x, this.pos.y);
        mainContext.beginPath();
        mainContext.moveTo(0, 0);
        mainContext.lineTo(this.dir.x * 10, this.dir.y * 10);
        mainContext.stroke();
        mainContext.restore();
    }

    cast(wall: Boundary) {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;

        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir.x;
        const y4 = this.pos.y + this.dir.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        if (t > 0 && t < 1 && u > 0) {
            const pt = createVector();
            pt.x = x1 + t * (x2 - x1);
            pt.y = y1 + t * (y2 - y1);
            return pt;
        } else {
            return;
        }
    }
}

class Particle {
    pos: Vector2D;
    rays: Ray[];

    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.rays = [];
        for (let a = 0; a < 360; a += 1) {
            this.rays.push(new Ray(this.pos, Math.PI * 2 * (a / 360)));
        }
    }

    update(x: number, y: number) {
        this.pos.set(x, y);
    }

    look(walls: Boundary[]) {
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            let closest = null;
            let record = Infinity;
            for (let wall of walls) {
                const pt = ray.cast(wall);
                if (pt) {
                    const d = dist(this.pos.copy(), pt);
                    if (d < record) {
                        record = d;
                        closest = pt;
                    }
                }
            }
            if (closest) {
                // colorMode(HSB);
                // stroke((i + frameCount * 2) % 360, 255, 255, 50);

                mainContext.strokeStyle = 'rgba(255, 255, 255, 0.4)';

                mainContext.beginPath();
                mainContext.moveTo(this.pos.x, this.pos.y);
                mainContext.lineTo(closest.x, closest.y);
                mainContext.stroke();
            }
        }
    }

    show() {
        mainContext.fillStyle = 'rgba(255, 255, 255, 1)';
        mainContext.arc(this.pos.x, this.pos.y, 4, 0, Math.PI * 2);

        for (let ray of this.rays) {
            ray.show();
        }
    }
}
</script>
<style lang="scss" scoped>
.ray-casting-2d {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
