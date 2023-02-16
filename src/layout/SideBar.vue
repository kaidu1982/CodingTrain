<template>
    <div class="sidebar">
        <h2>Example</h2>
        <div
            class="menu"
            :class="{
                selected: router.currentRoute.value.path === '/quickSort',
            }"
            @click="routerPush('QuickSort')"
        >
            QuickSort
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path ===
                    '/quadTreeParticleCollisions',
            }"
            @click="routerPush('QuadTreeParticleCollisions')"
        >
            QuadTreeParticleCollisions
        </div>
        <div
            class="menu"
            :class="{
                selected: router.currentRoute.value.path === '/quadTree',
            }"
            @click="routerPush('QuadTree')"
        >
            QuadTree
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path === '/flockingSimulation',
            }"
            @click="routerPush('FlockingSimulation')"
        >
            FlockingSimulation
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path === '/aStarPathFinding',
            }"
            @click="routerPush('AStarPathFinding')"
        >
            A* PathFinding
        </div>
        <div
            class="menu"
            :class="{
                selected: router.currentRoute.value.path === '/starfield',
            }"
            @click="routerPush('Starfield')"
        >
            Starfield
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path === '/animatedCirclePacking',
            }"
            @click="routerPush('AnimatedCirclePacking')"
        >
            AnimatedCirclePacking
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path ===
                    '/animatedCirclePackingColor',
            }"
            @click="routerPush('AnimatedCirclePackingColor')"
        >
            AnimatedCirclePackingColor
        </div>
        <div
            class="menu"
            :class="{
                selected: router.currentRoute.value.path === '/imageToAscii',
            }"
            @click="routerPush('ImageToAscii')"
        >
            ImageToAscii
        </div>
        <div
            class="menu"
            :class="{
                selected: router.currentRoute.value.path === '/cameraToAscii',
            }"
            @click="routerPush('CameraToAscii')"
        >
            CameraToAscii
        </div>
        <div
            class="menu"
            :class="{
                selected:
                    router.currentRoute.value.path === '/waveFunctionCollapse',
            }"
            @click="routerPush('WaveFunctionCollapse')"
        >
            WaveFunctionCollapse
        </div>
    </div>
</template>

<script lang="ts" setup>
import { routerPush } from '@/router.js';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.sidebar {
    width: 300px;
    height: 100vh;
    display: flex;
    flex: 300px 0 0;
    flex-direction: column;
    padding: 24px 16px;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #e8e8e8;
    h2 {
        margin: 16px 0;
        color: #049ef4;
    }

    div.menu {
        margin: 4px 0;
        cursor: pointer;
        &:hover {
            color: #049ef4;
        }

        &.selected {
            color: #049ef4;
            text-decoration: underline;
        }
    }
}
</style>
