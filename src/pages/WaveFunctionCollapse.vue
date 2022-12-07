<script setup lang="ts">
import CanvasWrapper from '@/components/CanvasWrapper.vue';
import Toolbar from '@/components/Toolbar.vue';
</script>

<template>
    <div class="wave-function-collapse">
        <toolbar class="toolbar" />
        <canvas-wrapper />
    </div>
</template>

<style lang="scss" scoped>
.wave-function-collapse {
    display: flex;
    flex-direction: column;
    width: 600px !important;
    .toolbar {
        margin-bottom: 30px;
        width: 600px;
    }
}
</style>
