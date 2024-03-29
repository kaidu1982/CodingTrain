<template>
    <div class="image-to-ascii">
        <h3>Image To Ascii</h3>

        <div class="photo-list">
            <div>
                <h4>original</h4>
                <canvas ref="mainCanvasRef" />
            </div>
            <div>
                <h4>ascii</h4>
                <canvas ref="asciiCanvasRef" />
            </div>
            <div>
                <h4>ascii+grey</h4>
                <canvas ref="greyCanvasRef" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { loadGloria } from '@/components/util';

const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();

const asciiCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();
const greyCanvasRef: Ref<HTMLCanvasElement | undefined> =
    ref<HTMLCanvasElement>();

const width = ref(400);
const height = ref(400);

const renderGloria = async () => {
    const gloriaImg = await loadGloria();

    if (mainContext) {
        mainContext.drawImage(
            gloriaImg.canvas,
            0,
            0,
            mainContext.canvas.width,
            mainContext.canvas.height
        );
    }
    if (greyContext && asciiContext) {
        const imageData = gloriaImg.getImageData(
            0,
            0,
            gloriaImg.canvas.width,
            gloriaImg.canvas.height
        );
        const w = greyContext.canvas.width / gloriaImg.canvas.width;
        const h = greyContext.canvas.height / gloriaImg.canvas.height;
        const originalPixels = new Uint8ClampedArray(imageData.data);

        greyContext.fillStyle = '#000000';
        greyContext.fillRect(
            0,
            0,
            greyContext.canvas.width,
            greyContext.canvas.height
        );
        greyContext.font = `${w}px arial`;
        greyContext.textAlign = 'center';
        greyContext.textBaseline = 'middle';

        asciiContext.fillStyle = '#000000';
        asciiContext.fillRect(
            0,
            0,
            asciiContext.canvas.width,
            asciiContext.canvas.height
        );
        asciiContext.font = `${w}px arial`;
        asciiContext.textAlign = 'center';
        asciiContext.textBaseline = 'middle';
        asciiContext.fillStyle = '#ffffff';
        for (let i = 0; i < gloriaImg.canvas.width; i++) {
            for (let j = 0; j < gloriaImg.canvas.height; j++) {
                const pixelIndex = (i + j * gloriaImg.canvas.width) * 4;
                const r = originalPixels[pixelIndex + 0];
                const g = originalPixels[pixelIndex + 1];
                const b = originalPixels[pixelIndex + 2];
                const avg = (r + g + b) / 3;

                const charIndex =
                    density.length - Math.floor((avg / 255) * density.length);

                greyContext.fillStyle = `rgb(${avg},${avg},${avg})`;
                greyContext.fillText(
                    density.charAt(charIndex),
                    i * w + w * 0.5,
                    j * h + h * 0.5
                );

                asciiContext.fillText(
                    density.charAt(charIndex),
                    i * w + w * 0.5,
                    j * h + h * 0.5
                );
            }
        }
    }
};

const density = 'Ñ@#W$9876543210?!abc;:+=-,._ ';

let mainContext: CanvasRenderingContext2D | undefined = undefined;
let asciiContext: CanvasRenderingContext2D | undefined = undefined;
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
    }

    if (greyCanvasRef.value) {
        greyCanvasRef.value.width = devicePixelRatio * width.value;
        greyCanvasRef.value.height = devicePixelRatio * height.value;

        greyContext = greyCanvasRef.value.getContext(
            '2d'
        ) as CanvasRenderingContext2D;
    }

    if (asciiCanvasRef.value) {
        asciiCanvasRef.value.width = devicePixelRatio * width.value;
        asciiCanvasRef.value.height = devicePixelRatio * height.value;

        asciiContext = asciiCanvasRef.value.getContext(
            '2d'
        ) as CanvasRenderingContext2D;
    }
};

onMounted(async () => {
    initCanvas();
    await renderGloria();
});
</script>

<style lang="scss" scoped>
.image-to-ascii {
    display: flex;
    flex-direction: column;
    h3 {
        margin: 16px 0;
    }
    .photo-list {
        > div {
            display: flex;
            flex-direction: column;
            margin: 10px 0;
            width: 500px;

            h4 {
                margin: 10px 0 4px 0;
            }
        }
    }
}
</style>
