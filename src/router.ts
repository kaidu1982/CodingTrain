import type { RouteParams, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import MainTemplate from '@/layout/MainTemplate.vue';
import ImageToAscii from '@/pages/ImageToAscii.vue';
import WaveFunctionCollapse from '@/pages/WaveFunctionCollapse.vue';
import CameraToAscii from '@/pages/CameraToAscii.vue';
import AnimatedCirclePacking from '@/pages/AnimatedCirclePacking.vue';
import AnimatedCirclePackingColor from '@/pages/AnimatedCirclePackingColor.vue';
import Starfield from '@/pages/Starfield.vue';

export type AppRouteNames =
    | 'ImageToAscii'
    | 'AnimatedCirclePacking'
    | 'AnimatedCirclePackingColor'
    | 'CameraToAscii'
    | 'WaveFunctionCollapse'
    | 'Starfield';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        alias: '/pages',
        redirect: '/starfield',
        component: MainTemplate,
        children: [
            {
                name: 'Starfield',
                path: 'starfield',
                component: Starfield,
            },
            {
                name: 'AnimatedCirclePacking',
                path: 'animatedCirclePacking',
                component: AnimatedCirclePacking,
            },
            {
                name: 'AnimatedCirclePackingColor',
                path: 'animatedCirclePackingColor',
                component: AnimatedCirclePackingColor,
            },
            {
                name: 'ImageToAscii',
                path: 'imageToAscii',
                component: ImageToAscii,
            },
            {
                name: 'CameraToAscii',
                path: 'cameraToAscii',
                component: CameraToAscii,
            },
            {
                name: 'WaveFunctionCollapse',
                path: 'waveFunctionCollapse',
                component: WaveFunctionCollapse,
            },
        ],
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export function routerPush(
    name: AppRouteNames,
    params?: RouteParams
): ReturnType<typeof router.push> {
    if (params !== undefined) {
        return router.push({
            name,
            params,
        });
    } else {
        return router.push({ name: name });
    }
}
