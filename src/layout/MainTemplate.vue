<template>
    <div class="main">
        <side-bar class="left" />
        <router-view class="contents" />
    </div>
</template>

<script lang="ts" setup>
import SideBar from './SideBar.vue';
</script>
<style lang="scss" scoped>
.main {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;

    .contents {
        flex-grow: 1;
        padding: 24px;
        display: flex;
    }
}
</style>
