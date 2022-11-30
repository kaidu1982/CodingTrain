<template>
  <div class="canvas-wrapper">
    <h3>Wave Function Collapse</h3>
    <canvas />
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive} from "vue";
import {preload} from "../util";

interface Data {
  images: HTMLImageElement[]
}
const state: Data = reactive({images: []})




onMounted(async () => {
  state.images = preload();
});

//TODO 레티나 고려해야함. 실제 렌더링은 2배가 되겠지...
// const props = defineProps({
//   width: {
//     type: Number,
//     default: 400,
//   },
//   height: {
//     type: Number,
//     default: 400,
//   },
// });
</script>

<style lang="scss" scoped>
.canvas-wrapper {

  canvas {
    width: 400px;
    height: 400px;
  }
}
</style>
