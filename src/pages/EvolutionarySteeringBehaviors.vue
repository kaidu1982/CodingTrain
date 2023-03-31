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
import { blendColors } from '@/class/Color';

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

const vehicles: Vehicle[] = [];
const food: Vector2D[] = [];
const poison: Vector2D[] = [];

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const draw = (timestamp: number) => {
    if (lastTimestamp > 0) {
        const delta = timestamp - lastTimestamp;
        renderTime += delta;
    }

    if (renderTime > 100) {
        renderTime -= 100;
        mainContext.fillStyle = 'rgb(0, 0, 0)';
        mainContext.fillRect(0, 0, width, height);

        if (random(1) < 0.1) {
            const x = random(width);
            const y = random(height);
            food.push(createVector(x, y));
        }

        if (random(1) < 0.01) {
            const x = random(width);
            const y = random(height);
            poison.push(createVector(x, y));
        }

        for (let i = 0; i < food.length; i++) {
            mainContext.beginPath();
            mainContext.fillStyle = 'rgb(0, 255, 0)';
            mainContext.arc(food[i].x, food[i].y, 4, 0, Math.PI * 2, true);
            mainContext.fill();
        }

        for (let i = 0; i < poison.length; i++) {
            mainContext.beginPath();
            mainContext.fillStyle = 'rgb(255, 0, 0)';
            mainContext.arc(poison[i].x, poison[i].y, 4, 0, Math.PI * 2, true);
            mainContext.fill();
        }

        for (let i = vehicles.length - 1; i >= 0; i--) {
            vehicles[i].boundaries();
            vehicles[i].behaviors(food, poison);
            vehicles[i].update();
            vehicles[i].display();
            const newVehicle = vehicles[i].clone();
            if (newVehicle != null) {
                vehicles.push(newVehicle);
            }
            if (vehicles[i].dead()) {
                const x = vehicles[i].position.x;
                const y = vehicles[i].position.y;
                food.push(createVector(x, y));
                vehicles.splice(i, 1);
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

    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(height);
        vehicles[i] = new Vehicle(x, y);
    }

    for (let i = 0; i < 40; i++) {
        const x = random(width);
        const y = random(height);
        food.push(createVector(x, y));
    }

    for (let i = 0; i < 20; i++) {
        const x = random(width);
        const y = random(height);
        poison.push(createVector(x, y));
    }

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

const mr = 0.01;
class Vehicle {
    acceleration: Vector2D;
    velocity: Vector2D;
    position: Vector2D;

    dna: number[];

    r: number;
    maxspeed: number;
    maxforce: number;
    health: number;

    constructor(x: number, y: number, dna?: number[]) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, -2);
        this.position = createVector(x, y);
        this.r = 4;
        this.maxspeed = 5;
        this.maxforce = 0.5;

        this.health = 1;

        this.dna = [];
        if (dna === undefined) {
            // Food weight
            this.dna[0] = random(-2, 2);
            // Poison weight
            this.dna[1] = random(-2, 2);
            // Food perception
            this.dna[2] = random(0, 100);
            // Poision Percepton
            this.dna[3] = random(0, 100);
        } else {
            // Mutation
            this.dna[0] = dna[0];
            if (random(1) < mr) {
                this.dna[0] += random(-0.1, 0.1);
            }
            this.dna[1] = dna[1];
            if (random(1) < mr) {
                this.dna[1] += random(-0.1, 0.1);
            }
            this.dna[2] = dna[2];
            if (random(1) < mr) {
                this.dna[2] += random(-10, 10);
            }
            this.dna[3] = dna[3];
            if (random(1) < mr) {
                this.dna[3] += random(-10, 10);
            }
        }
    }

    // Method to update location
    update() {
        this.health -= 0.005;

        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);

        console.log('this.velocity', this.velocity);
        this.position.add(this.velocity);
        // Reset accelerationelertion to 0 each cycle
        this.acceleration.multiScale(0);
    }

    applyForce(force: Vector2D) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    behaviors(good: Vector2D[], bad: Vector2D[]) {
        const steerG = this.eat(good, 0.2, this.dna[2]);
        const steerB = this.eat(bad, -1, this.dna[3]);

        steerG.multiScale(this.dna[0]);
        steerB.multiScale(this.dna[1]);

        this.applyForce(steerG);
        this.applyForce(steerB);
    }

    clone() {
        if (random(1) < 0.002) {
            return new Vehicle(this.position.x, this.position.y, this.dna);
        } else {
            return null;
        }
    }

    eat(list: Vector2D[], nutrition: number, perception: number) {
        let record = Infinity;
        let closest = null;
        for (let i = list.length - 1; i >= 0; i--) {
            const d = this.position.dist(list[i]);

            if (d < this.maxspeed) {
                list.splice(i, 1);
                this.health += nutrition;
            } else {
                if (d < record && d < perception) {
                    record = d;
                    closest = list[i];
                }
            }
        }

        // This is the moment of eating!

        if (closest != null) {
            return this.seek(closest);
        }

        return createVector(0, 0);
    }

    // A method that calculates a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target: Vector2D) {
        const desired = target.copy();
        desired.sub(this.position);

        // Scale to maximum speed
        desired.setMag(this.maxspeed);

        const steer = desired.copy();
        desired.sub(this.velocity);
        // Steering = Desired minus velocity
        steer.limit(this.maxforce); // Limit to maximum steering force

        return steer;
        //this.applyForce(steer);
    }

    dead() {
        return this.health < 0;
    }

    display() {
        // Draw a triangle rotated in the direction of velocity
        const angle = this.velocity.heading() + Math.PI / 2;

        console.log('this.position', this.position);
        mainContext.save();
        mainContext.translate(this.position.x, this.position.y);
        mainContext.rotate(angle);

        // if (debug.checked()) {
        //     strokeWeight(3);
        //     stroke(0, 255, 0);
        //     noFill();
        //     line(0, 0, 0, -this.dna[0] * 25);
        //     strokeWeight(2);
        //     ellipse(0, 0, this.dna[2] * 2);
        //     stroke(255, 0, 0);
        //     line(0, 0, 0, -this.dna[1] * 25);
        //     ellipse(0, 0, this.dna[3] * 2);
        // }

        const gr = '#00ff00'; // Red
        const rd = '#ff0000'; // Green

        const blendedColor = blendColors(gr, rd, this.health);
        console.log('blendedColor', blendedColor);

        mainContext.fillStyle = blendedColor;
        mainContext.strokeStyle = blendedColor;
        mainContext.lineWidth = 1;
        mainContext.beginPath();
        mainContext.moveTo(0, -this.r * 2);
        mainContext.lineTo(-this.r, this.r * 2);
        mainContext.lineTo(this.r, this.r * 2);
        //
        mainContext.closePath();
        mainContext.fill();
        mainContext.stroke();

        mainContext.restore();
    }

    boundaries() {
        const d = 25;

        let desired = null;

        if (this.position.x < d) {
            desired = createVector(this.maxspeed, this.velocity.y);
        } else if (this.position.x > width - d) {
            desired = createVector(-this.maxspeed, this.velocity.y);
        }

        if (this.position.y < d) {
            desired = createVector(this.velocity.x, this.maxspeed);
        } else if (this.position.y > height - d) {
            desired = createVector(this.velocity.x, -this.maxspeed);
        }

        if (desired !== null) {
            desired.normalize();
            desired.multiScale(this.maxspeed);
            const steer = desired.copy();
            steer.sub(this.velocity);

            steer.limit(this.maxforce);
            this.applyForce(steer);
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
