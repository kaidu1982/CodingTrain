<template>
    <div class="flocking-simulation">
        <canvas ref="mainCanvasRef" />
    </div>
</template>

<script lang="ts" setup>
// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM

import { Vector2D, random2D, createVector } from '@/class/Vector';
import { dist, random } from '@/util/MathUtil';
import { onMounted, onUnmounted, Ref, ref } from 'vue';

const width = 600;
const height = 600;

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();

const flock: Boid[] = [];
onMounted(() => {
    const canvasEl = mainCanvasRef.value as HTMLCanvasElement;
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    canvasEl.width = devicePixelRatio * canvasEl.clientWidth;
    canvasEl.height = devicePixelRatio * canvasEl.clientHeight;

    mainContext = (mainCanvasRef.value as HTMLCanvasElement).getContext(
        '2d'
    ) as CanvasRenderingContext2D;

    mainContext.scale(devicePixelRatio, devicePixelRatio);

    for (let i = 0; i < 50; i++) {
        flock.push(new Boid());
    }

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

const draw = (timestamp: number) => {
    const delta = timestamp - lastTimestamp;
    renderTime += delta;

    mainContext.fillStyle = '#000000';
    mainContext.fillRect(
        0,
        0,
        mainContext.canvas.clientWidth,
        mainContext.canvas.clientHeight
    );

    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.show();
    }
    ani.value = requestAnimationFrame(draw);
};

class Boid {
    position: Vector2D;
    velocity: Vector2D;
    acceleration: Vector2D;
    maxForce: number;
    maxSpeed: number;

    constructor() {
        this.position = new Vector2D(random(width), random(height));
        this.velocity = random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = new Vector2D();
        this.maxForce = 0.2;
        this.maxSpeed = 5;
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    align(boids: any) {
        let perceptionRadius = 25;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(
                this.position.x,
                other.position.x,
                this.position.y,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.divScale(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids: any) {
        let perceptionRadius = 24;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(
                this.position.x,
                other.position.x,
                this.position.y,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                let diff = this.position.copy();
                diff.sub(other.position);
                // let diff = p5.Vector.sub(this.position, other.position);
                diff.divScale(d * d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.divScale(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids: any) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(
                this.position.x,
                other.position.x,
                this.position.y,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.divScale(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    flock(boids: any) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        // alignSlider = createSlider(0, 2, 1.5, 0.1);
        // cohesionSlider = createSlider(0, 2, 1, 0.1);
        // separationSlider = createSlider(0, 2, 2, 0.1);
        //   alignment.mult(alignSlider.value());
        //   cohesion.mult(cohesionSlider.value());
        //   separation.mult(separationSlider.value());
        alignment.multiScale(1);
        cohesion.multiScale(1);
        separation.multiScale(1);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.multiScale(0);
    }

    show() {
        mainContext.fillStyle = 'rgb(255, 255, 255)';
        mainContext.beginPath();
        mainContext.arc(this.position.x, this.position.y, 6, 0, Math.PI * 2);

        mainContext.fill();
    }
}
</script>

<style lang="scss" scoped>
.flocking-simulation {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
