<template>
    <div class="quad-tree">
        <canvas ref="mainCanvasRef" @mousemove="handleMouseMove" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { random } from '@/util/MathUtil';
import { he } from 'vuetify/locale';

const width = 600;
const height = 600;

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
let mainContext: CanvasRenderingContext2D;
let lastTimestamp = 0;
let renderTime = 0;
const ani = ref();
let qt: QuadTree | undefined;

let lastMouseEvent: MouseEvent | null = null;
const handleMouseMove = (e: MouseEvent) => {
    lastMouseEvent = e;
};

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

    qt?.show();

    if (lastMouseEvent) {
        const { offsetX, offsetY } = lastMouseEvent;

        const range = new Rectangle(offsetX, offsetY, 25, 25);

        mainContext.fillStyle = '#00ff00';
        mainContext.strokeStyle = '#00ff00';
        const { left, top, x, y, w, h } = range;
        mainContext.strokeRect(left, top, w * 2, h * 2);
        const points = qt?.query(range, undefined);

        mainContext.beginPath();
        points?.forEach((p: Point) => {
            mainContext.moveTo(p.x, p.y);
            mainContext.arc(p.x, p.y, 2, 0, Math.PI * 2);
        });
        mainContext.fill();
    }

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

    const boundary = new Rectangle(300, 300, 200, 200);
    qt = new QuadTree(boundary, 4);

    for (let i = 0; i < 300; i++) {
        let x = random(100, 500);
        let y = random(100, 500);
        let p = new Point(x, y);
        qt.insert(p);
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
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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

    query(range: Rectangle, found: undefined | Point[]) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return;
        } else {
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
        }
        return found;
    }

    show() {
        mainContext.strokeStyle = '#fff';
        mainContext.fillStyle = '#fff';
        const { left, top, x, y, w, h } = this.boundary;
        mainContext.strokeRect(left, top, w * 2, h * 2);

        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
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
