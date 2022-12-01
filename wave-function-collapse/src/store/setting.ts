import { ref } from 'vue';
import { defineStore } from 'pinia';

export type ICON = 'circuit' | 'demo' | 'pipes' | 'roads';
export type DIMENSION = 5 | 10 | 15 | 20;

export const useSetting = defineStore('setting', () => {
    const icon = ref<ICON>('circuit');

    const updateIcon = (iconType: ICON) => {
        icon.value = iconType;
    };

    const dimension = ref<DIMENSION>(10);
    const updateDimension = (dimensionValue: DIMENSION) => {
        dimension.value = dimensionValue;
    };

    return {
        icon,
        updateIcon,
        dimension,
        updateDimension,
    };
});
