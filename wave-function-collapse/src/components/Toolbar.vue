<template>
    <div class="toolbar">
        <div>
            <span>ICON</span>
            <v-btn-toggle v-model="iconType" color="deep-purple-accent-3" group>
                <v-btn value="circuit"> circuit </v-btn>

                <v-btn value="demo"> demo </v-btn>

                <v-btn value="pipes"> pipes </v-btn>

                <v-btn value="roads"> roads </v-btn>
            </v-btn-toggle>
        </div>
        <div>
            <span>Dimension</span>

            <v-btn-toggle
                v-model="dimensionType"
                color="deep-purple-accent-3"
                group
            >
                <v-btn value="5"> 5 </v-btn>

                <v-btn value="10"> 10 </v-btn>

                <v-btn value="15"> 15 </v-btn>

                <v-btn value="20"> 20 </v-btn>
            </v-btn-toggle>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ICON, useSetting } from '../store/setting';
import { computed, ComputedRef, ref, watch, WritableComputedRef } from 'vue';

const { icon, updateIcon, dimension, updateDimension } = useSetting();

// const text = ref('circuit');
const iconType: WritableComputedRef<any> = computed({
    get: () => useSetting().icon,
    set: (val) => updateIcon(val),
});

const dimensionType = computed({
    get: () => useSetting().dimension,
    set: (val) => updateDimension(val),
});
</script>

<style lang="scss" scoped>
.toolbar {
    display: flex;
    flex-direction: column;

    > div {
        display: flex;
        justify-content: space-between;
        > span {
            line-height: 48px;
        }
        margin-bottom: 10px;
    }
}
</style>
