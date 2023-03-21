<template>
    <div class="rendering-ray-casting">
        <canvas
            ref="mainCanvasRef"
            @mousemove="handleMouseMove"
            @keydown.left="LEFT_ARROW.value = true"
            @keydown.right="RIGHT_ARROW.value = true"
            @keydown.up="UP_ARROW.value = true"
            @keydown.down="DOWN_ARROW.value = true"
        />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { random } from '@/util/MathUtil';
import { createVector, dist, fromAngle, map, Vector2D } from '@/class/Vector';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;

const LEFT_ARROW = ref<boolean>(false);
const RIGHT_ARROW = ref(false);
const UP_ARROW = ref(false);
const DOWN_ARROW = ref(false);
const width = 800;
const height = 400;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

let walls: Boundary[] = [];

let particle: Particle;
let ray;

const sceneW = 400;
const sceneH = 400;
let sliderFOV = 60;

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;

        if (LEFT_ARROW.value) {
            particle.rotate(-0.01);
        } else if (RIGHT_ARROW.value) {
            particle.rotate(0.01);
        } else if (UP_ARROW.value) {
            particle.move(1);
        } else if (DOWN_ARROW.value) {
            particle.move(-1);
        }

        mainContext.fillStyle = '#000000';
        mainContext.fillRect(0, 0, width, height);

        for (let wall of walls) {
            wall.show();
        }

        particle.show();

        const scene = particle.look(walls);

        const w = sceneW / scene.length;

        mainContext.save();
        mainContext.translate(sceneW, 0);
        for (let i = 0; i < scene.length; i++) {
            const sq = scene[i] * scene[i];
            const wSq = sceneW * sceneW;
            const b = map(sq, 0, wSq, 255, 0);
            const h = map(scene[i], 0, sceneW, sceneH, 0);
            mainContext.fillStyle = `rgb(${b}, ${b}, ${b})`;

            // rectMode(CENTER);

            mainContext.fillRect(i * w + w / 2, sceneH / 2, w + 1, h);
        }
        mainContext.restore();
    }

    lastTimestamp = timestamp;
    ani.value = requestAnimationFrame(draw);
};

const changeFOV = () => {
    // const fov = sliderFOV.value();
    particle.updateFOV(sliderFOV);
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

    for (let i = 0; i < 4; i++) {
        let x1 = random(sceneW);
        let x2 = random(sceneW);
        let y1 = random(sceneH);
        let y2 = random(sceneH);
        walls[i] = new Boundary(x1, y1, x2, y2);
    }
    walls.push(new Boundary(0, 0, sceneW, 0));
    walls.push(new Boundary(sceneW, 0, sceneW, sceneH));
    walls.push(new Boundary(sceneW, sceneH, 0, sceneH));
    walls.push(new Boundary(0, sceneH, 0, 0));

    particle = new Particle();
    particle.updateFOV(sliderFOV);

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

    setAngle(angle: number) {
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
    fov: number;
    pos: Vector2D;
    rays: Ray[];
    heading: number;

    constructor() {
        this.fov = 45;
        this.pos = createVector(width / 2, height / 2);
        this.rays = [];
        this.heading = 0;
        // for (let a = 0; a < 360; a += 1) {
        //     this.rays.push(new Ray(this.pos, Math.PI * 2 * (a / 360)));
        // }

        for (let a = -this.fov / 2; a < this.fov / 2; a += 1) {
            this.rays.push(new Ray(this.pos, Math.PI * 2 * (a / 360)));
        }
    }

    update(x: number, y: number) {
        this.pos.set(x, y);
    }

    updateFOV(fov: number) {
        this.fov = fov;
        this.rays = [];
        for (let a = -this.fov / 2; a < this.fov / 2; a += 1) {
            this.rays.push(
                new Ray(this.pos, Math.PI * 2 * (a / 360) + this.heading)
            );
        }
    }

    rotate(angle: number) {
        this.heading += angle;
        let index = 0;
        for (let a = -this.fov / 2; a < this.fov / 2; a += 1) {
            this.rays[index].setAngle(Math.PI * 2 * (a / 360) + this.heading);
            index++;
        }
    }

    move(amt: number) {
        const vel = fromAngle(this.heading);

        vel.setMag(amt);
        this.pos.add(vel);
    }

    look(walls: Boundary[]) {
        const scene = [];
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            let closest = null;
            let record = Infinity;
            for (let wall of walls) {
                const pt = ray.cast(wall);

                if (pt) {
                    let d = dist(this.pos.copy(), pt);
                    const a = ray.dir.heading() - this.heading;

                    d *= Math.cos(a);

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

            scene[i] = record;
        }

        return scene;
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
.rendering-ray-casting {
    display: flex;
    flex-direction: column;

    canvas {
        width: 800px;
        height: 400px;
    }
}
</style>
