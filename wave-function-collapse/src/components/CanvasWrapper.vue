<template>
    <div class="canvas-wrapper">
        <h3>Wave Function Collapse</h3>
        <canvas ref="mainCanvasRef" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, Ref, watch } from 'vue';
import { preload } from '../util';
import { Cell } from '../cell';
import { Tile } from '../tile';
import { useSetting } from '../store/setting';

interface Data {
    circuit: HTMLImageElement[];
    demo: HTMLImageElement[];
    pipes: HTMLImageElement[];
    roads: HTMLImageElement[];
}
const state: Data = reactive({ circuit: [], demo: [], pipes: [], roads: [] });

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
const width = ref(400);
const height = ref(400);

let DIM = 10;
let tiles: Tile[] = [];
let grid: Cell[] = [];

let mainContext: CanvasRenderingContext2D | undefined = undefined;
const initCanvas = () => {
    if (mainCanvasRef.value) {
        width.value = mainCanvasRef.value.clientWidth;
        height.value = mainCanvasRef.value.clientHeight;

        const devicePixelRatio = window.devicePixelRatio ?? 1;
        mainCanvasRef.value.width = devicePixelRatio * width.value;
        mainCanvasRef.value.height = devicePixelRatio * height.value;

        mainContext = mainCanvasRef.value.getContext(
            '2d'
        ) as CanvasRenderingContext2D;

        mainContext.scale(devicePixelRatio, devicePixelRatio);
        mainContext.fillStyle = '#000000';
        mainContext.fillRect(0, 0, width.value, height.value);
    }
};

const startOver = () => {
    // Create cell for each spot on the grid
    for (let i = 0; i < DIM * DIM; i++) {
        grid[i] = new Cell(tiles.length);
    }
};

const random = <T>(arr: T[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
};
const checkValid = (arr: number[], valid: number[]) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        // VALID: [BLANK, RIGHT]
        // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
        // result in removing UP, DOWN, LEFT
        let element = arr[i];
        // console.log(element, valid.includes(element));
        if (!valid.includes(element)) {
            arr.splice(i, 1);
        }
    }
};
const draw = () => {
    if (mainContext) {
        mainContext.fillStyle = '#000000';
        mainContext.fillRect(0, 0, width.value, height.value);

        const w = width.value / DIM;
        const h = height.value / DIM;

        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let cell = grid[i + j * DIM];

                if (cell.collapsed) {
                    let index = cell.options[0];

                    mainContext.drawImage(tiles[index].img, i * w, j * h, w, h);
                } else {
                    mainContext.strokeStyle = '#515151';
                    mainContext.strokeRect(i * w, j * h, w, h);
                }
            }
        }
        let gridCopy = grid.slice();
        gridCopy = gridCopy.filter((a) => !a.collapsed);

        if (gridCopy.length == 0) {
            return;
        }
        gridCopy.sort((a, b) => {
            return a.options.length - b.options.length;
        });

        let len = gridCopy[0].options.length;
        let stopIndex = 0;
        for (let i = 1; i < gridCopy.length; i++) {
            if (gridCopy[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }

        if (stopIndex > 0) gridCopy.splice(stopIndex);
        const cell = random(gridCopy);
        cell.collapsed = true;
        const pick = random(cell.options);
        if (pick === undefined) {
            startOver();
            return;
        }
        cell.options = [pick];

        const nextGrid = [];
        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let index = i + j * DIM;
                if (grid[index].collapsed) {
                    nextGrid[index] = grid[index];
                } else {
                    let options = new Array(tiles.length)
                        .fill(0)
                        .map((x, i) => i);
                    // Look up
                    if (j > 0) {
                        let up = grid[i + (j - 1) * DIM];
                        let validOptions: number[] = [];
                        for (let option of up.options) {
                            let valid = tiles[option].down;
                            validOptions = validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look right
                    if (i < DIM - 1) {
                        let right = grid[i + 1 + j * DIM];
                        let validOptions: number[] = [];
                        for (let option of right.options) {
                            let valid = tiles[option].left;
                            validOptions = validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look down
                    if (j < DIM - 1) {
                        let down = grid[i + (j + 1) * DIM];
                        let validOptions: number[] = [];
                        for (let option of down.options) {
                            let valid = tiles[option].up;
                            validOptions = validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look left
                    if (i > 0) {
                        let left = grid[i - 1 + j * DIM];
                        let validOptions: number[] = [];
                        for (let option of left.options) {
                            let valid = tiles[option].right;
                            validOptions = validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }

                    // I could immediately collapse if only one option left?
                    nextGrid[index] = new Cell(options);
                }
            }
        }

        grid = nextGrid;
    }
};

onMounted(async () => {
    state.circuit = preload();
    state.demo = preload('demo');
    state.pipes = preload('pipes');
    state.roads = preload('roads');

    addTile();

    initCanvas();

    setInterval(() => {
        draw();
    }, 100);
});

const addTile = () => {
    tiles = [];
    if (useSetting().icon === 'circuit') {
        tiles[0] = new Tile(state.circuit[0], ['AAA', 'AAA', 'AAA', 'AAA']);
        tiles[1] = new Tile(state.circuit[1], ['BBB', 'BBB', 'BBB', 'BBB']);
        tiles[2] = new Tile(state.circuit[2], ['BBB', 'BCB', 'BBB', 'BBB']);
        tiles[3] = new Tile(state.circuit[3], ['BBB', 'BDB', 'BBB', 'BDB']);
        tiles[4] = new Tile(state.circuit[4], ['ABB', 'BCB', 'BBA', 'AAA']);
        tiles[5] = new Tile(state.circuit[5], ['ABB', 'BBB', 'BBB', 'BBA']);
        tiles[6] = new Tile(state.circuit[6], ['BBB', 'BCB', 'BBB', 'BCB']);
        tiles[7] = new Tile(state.circuit[7], ['BDB', 'BCB', 'BDB', 'BCB']);
        tiles[8] = new Tile(state.circuit[8], ['BDB', 'BBB', 'BCB', 'BBB']);
        tiles[9] = new Tile(state.circuit[9], ['BCB', 'BCB', 'BBB', 'BCB']);
        tiles[10] = new Tile(state.circuit[10], ['BCB', 'BCB', 'BCB', 'BCB']);
        tiles[11] = new Tile(state.circuit[11], ['BCB', 'BCB', 'BBB', 'BBB']);
        tiles[12] = new Tile(state.circuit[12], ['BBB', 'BCB', 'BBB', 'BCB']);

        for (let i = 0; i < 12; i++) {
            tiles[i].index = i;
        }
    } else {
        const iconType = useSetting().icon;
        tiles[0] = new Tile(state[iconType][0], ['AAA', 'AAA', 'AAA', 'AAA']);
        tiles[1] = new Tile(state[iconType][1], ['ABA', 'ABA', 'BBB', 'ABA']);
        tiles[2] = new Tile(state[iconType][2], ['ABA', 'ABA', 'ABA', 'BBB']);
        tiles[3] = new Tile(state[iconType][3], ['BBB', 'ABA', 'ABA', 'ABA']);
        tiles[4] = new Tile(state[iconType][4], ['ABA', 'BBB', 'ABA', 'ABA']);

        for (let i = 0; i < 5; i++) {
            tiles[i].index = i;
        }
    }

    // const initialTileCount = tiles.length;
    // for (let i = 0; i < initialTileCount; i++) {
    //     let tempTiles = [];
    //     for (let j = 0; j < 4; j++) {
    //         tempTiles.push(tiles[i].rotate(j));
    //     }
    //     tempTiles = removeDuplicatedTiles(tempTiles);
    //     tiles = tiles.concat(tempTiles);
    // }

    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        tile.analyze(tiles);
    }

    startOver();
};
watch(
    () => useSetting().dimension,
    (dimension) => {
        DIM = dimension;
        startOver();
    }
);

watch(
    () => useSetting().icon,
    () => {
        addTile();
    }
);
</script>

<style lang="scss" scoped>
.canvas-wrapper {
    canvas {
        width: 600px;
        height: 600px;
    }
}
</style>
