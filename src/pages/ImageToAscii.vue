<template>
    <div class="image-to-ascii">
        <h3>Image To Ascii</h3>
        <div>
            <input ref="file" type="file" @change="handleFileUpload($event)" />
        </div>
        <div class="photo-list">
            <canvas ref="mainCanvasRef" />
            <canvas ref="greyCanvasRef" />
            <div ref="asciiImageRef"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>();

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();

const greyCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
const asciiImageRef: Ref<Element | undefined> = ref<Element>();
const width = ref(400);
const height = ref(400);

const grayRamp =
    '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const rampLength = grayRamp.length;

const getCharacterForGrayScale = (grayScale: number) =>
    grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];

const drawAscii = (grayScales: Uint8ClampedArray, width: number) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = getCharacterForGrayScale(grayScale);

        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    (asciiImageRef.value as Element).textContent = ascii;
};

const MAXIMUM_WIDTH = 80;
const MAXIMUM_HEIGHT = 50;

const clampDimensions = (width: number, height: number) => {
    if (height > MAXIMUM_HEIGHT) {
        const reducedWidth = Math.floor((width * MAXIMUM_HEIGHT) / height);
        return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
        const reducedHeight = Math.floor((height * MAXIMUM_WIDTH) / width);
        return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [width, height];
};

const handleFileUpload = ($event: Event) => {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
    }

    console.log('file.value', file.value);

    // const file = fileInput.value?.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            if (mainContext && greyContext) {
                mainContext.canvas.width = image.width;
                mainContext.canvas.height = image.height;

                mainContext.drawImage(image, 0, 0);

                const imageData = mainContext.getImageData(
                    0,
                    0,
                    image.width,
                    image.height
                );
                const originalPixels = new Uint8ClampedArray(imageData.data);

                const [width, height] = clampDimensions(
                    image.width,
                    image.height
                );

                console.log('clampDimensions', width, height);

                greyContext.canvas.width = width;
                greyContext.canvas.height = height;
                const grayScales = toRGBA(originalPixels, width, height);

                imageData.data.set(grayScales);
                greyContext.putImageData(imageData, 0, 0);

                drawAscii(grayScales, image.width);
            }
        };

        image.src = event.target?.result as string;
    };

    reader.readAsDataURL(file.value as File);
};

const toRGBA = (pixels: Uint8ClampedArray, width: number, height: number) => {
    const resultPixels = new Uint8ClampedArray(pixels.length);

    let p = 0;
    let w = 0;

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const value =
                pixels[w] * 0.299 +
                pixels[w + 1] * 0.587 +
                pixels[w + 2] * 0.114;
            //var value = (pixels[w] * 4899 + pixels[w + 1] * 9617 + pixels[w + 2] * 1868 + 8192) >> 14;
            resultPixels[p++] = value;
            resultPixels[p++] = value;
            resultPixels[p++] = value;
            resultPixels[p++] = pixels[w + 3];

            w += 4;
        }
    }
    return resultPixels;
};

let mainContext: CanvasRenderingContext2D | undefined = undefined;
let greyContext: CanvasRenderingContext2D | undefined = undefined;
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

        // mainContext.scale(devicePixelRatio, devicePixelRatio);
        // mainContext.fillStyle = '#000000';
        // mainContext.fillRect(0, 0, width.value, height.value);
    }

    if (greyCanvasRef.value) {
        greyCanvasRef.value.width = devicePixelRatio * width.value;
        greyCanvasRef.value.height = devicePixelRatio * height.value;

        greyContext = greyCanvasRef.value.getContext(
            '2d'
        ) as CanvasRenderingContext2D;

        // greyContext.scale(devicePixelRatio, devicePixelRatio);
    }
};

onMounted(async () => {
    initCanvas();
});
</script>

<style lang="scss" scoped>
.image-to-ascii {
    display: flex;
    flex-direction: column;

    .photo-list {
        div,
        canvas {
            display: inline-flex;
            margin: 10px 0;

            border: 1px solid #e8e8e8;
        }
    }
}
</style>
