<template>
    <div class="quad-tree">
        <canvas ref="mainCanvasRef" @mousemove="handleMouseMove" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';

import { dist, random } from '@/util/MathUtil';

const width = 600;
const height = 600;

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();
const particles: Particle[] = [];
let qt: QuadTree | undefined;

let lastMouseEvent: MouseEvent | null = null;
const handleMouseMove = (e: MouseEvent) => {
    lastMouseEvent = e;
};

const draw = (timestamp: number) => {
    const delta = timestamp - lastTimestamp;
    renderTime += delta;

    console.time('draw');
    mainContext.fillStyle = '#000000';
    mainContext.fillRect(
        0,
        0,
        mainContext.canvas.clientWidth,
        mainContext.canvas.clientHeight
    );

    const boundary = new Rectangle(300, 300, 300, 300);
    const qt = new QuadTree(boundary, 4);

    particles.forEach((p: Particle) => {
        const point = new Point(p.x, p.y, p);
        qt.insert(point);

        p.move();
        p.render();
        p.setHighlight(false);
    });

    //collision 체크 2000개 일때 50ms
    //query 데이터 이용 3ms
    particles.forEach((p: Particle) => {
        const range = new Circle(p.x, p.y, p.r * 2);
        let points = qt.query(range);
        for (let point of points) {
            let other = point.userData;
            // for (let other of particles) {
            if (p !== other && p.intersects(other)) {
                p.setHighlight(true);
            }
        }
    });
    console.timeEnd('draw');

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

    for (let i = 0; i < 2000; i++) {
        particles[i] = new Particle(random(width), random(height));
    }

    ani.value = requestAnimationFrame(draw);
});
onUnmounted(() => {
    cancelAnimationFrame(ani.value);
    lastTimestamp = 0;
    renderTime = 0;
});

class Point {
    x: number;
    y: number;
    userData: Particle;
    constructor(x: number, y: number, userData: Particle) {
        this.x = x;
        this.y = y;
        this.userData = userData;
    }
}

class Particle {
    x: number;
    y: number;
    r: number;
    highlight: boolean;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = 4;
        this.highlight = false;
    }

    intersects(other: Particle) {
        let d = dist(this.x, this.y, other.x, other.y);
        return d < this.r + other.r;
    }

    setHighlight(value: boolean) {
        this.highlight = value;
    }

    move() {
        this.x += random(-1, 1);
        this.y += random(-1, 1);
    }

    render() {
        if (this.highlight) {
            mainContext.fillStyle = '#fff';
        } else {
            mainContext.fillStyle = 'rgb(100, 100, 100)';
        }
        mainContext.beginPath();

        mainContext.moveTo(this.x, this.y);
        mainContext.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        mainContext.fill();
    }
}

class Circle {
    x: number;
    y: number;
    r: number;
    rSquared: number;
    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r * this.r;
    }

    contains(point: Point) {
        // check if the point is in the circle by checking if the euclidean distance of
        // the point and the center of the circle if smaller or equal to the radius of
        // the circle
        let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
        return d <= this.rSquared;
    }

    intersects(range: Rectangle) {
        var xDist = Math.abs(range.x - this.x);
        var yDist = Math.abs(range.y - this.y);

        // radius of the circle
        var r = this.r;

        var w = range.w;
        var h = range.h;

        var edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

        // no intersection
        if (xDist > r + w || yDist > r + h) return false;

        // intersection within the circle
        if (xDist <= w || yDist <= h) return true;

        // intersection on the edge of the circle
        return edges <= this.rSquared;
    }
}

class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    get left() {
        return this.x - this.w;
    }

    get right() {
        return this.x + this.w;
    }

    get top() {
        return this.y - this.h;
    }

    get bottom() {
        return this.y + this.h;
    }

    contains(point: Point) {
        return (
            this.left <= point.x &&
            point.x <= this.right &&
            this.top <= point.y &&
            point.y <= this.bottom
        );
    }

    intersects(range: Rectangle) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
        );
    }
}

class QuadTree {
    boundary: Rectangle;
    capacity: number;
    points: Point[];
    divided: boolean;

    northeast?: QuadTree;
    northwest?: QuadTree;
    southeast?: QuadTree;
    southwest?: QuadTree;

    constructor(boundary: Rectangle, capacity: number) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;

        this.northeast = undefined;
        this.northwest = undefined;
        this.southeast = undefined;
        this.southwest = undefined;
    }

    subdivide() {
        this.divided = true;
        const { x, y, w, h } = this.boundary;
        const ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        const nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        const se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        const sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.northeast = new QuadTree(ne, this.capacity);
        this.northwest = new QuadTree(nw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);
    }

    query(range: Rectangle | Circle, found?: Point[]) {
        if (!found) {
            found = [];
        }

        if (!range.intersects(this.boundary)) {
            return found;
        }

        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }
        if (this.divided) {
            this.northwest?.query(range, found);
            this.northeast?.query(range, found);
            this.southwest?.query(range, found);
            this.southeast?.query(range, found);
        }

        return found;
    }

    show() {
        mainContext.strokeStyle = '#fff';
        mainContext.fillStyle = '#fff';
        const { left, top, x, y, w, h } = this.boundary;
        mainContext.strokeRect(left, top, w * 2, h * 2);

        if (this.divided) {
            this.northeast?.show();
            this.northwest?.show();
            this.southeast?.show();
            this.southwest?.show();
        }

        mainContext.beginPath();
        this.points.forEach((p: Point) => {
            mainContext.moveTo(p.x, p.y);
            mainContext.arc(p.x, p.y, 2, 0, Math.PI * 2);
        });
        mainContext.fill();
    }

    insert(point: Point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (!this.divided) {
            if (this.points.length < this.capacity) {
                this.points.push(point);
                return true;
            }

            this.subdivide();
        }

        this.northeast?.insert(point);
        this.northwest?.insert(point);
        this.southeast?.insert(point);
        this.southwest?.insert(point);
    }
}
</script>

<style lang="scss" scoped>
.quad-tree {
    display: flex;
    flex-direction: column;

    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
