<script setup lang="ts">
import CanvasWrapper from './components/CanvasWrapper.vue';
import Toolbar from './components/Toolbar.vue';
</script>

<template>
    <div class="main">
        <toolbar class="toolbar" />
        <canvas-wrapper />
    </div>
</template>

<style lang="scss" scoped>
.main {
    .toolbar {
        margin-bottom: 30px;
    }
}
</style>
