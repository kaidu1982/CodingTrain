import type { RouteParams, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import MainTemplate from '@/layout/MainTemplate.vue';
import ImageToAscii from '@/pages/ImageToAscii.vue';
import WaveFunctionCollapse from '@/pages/WaveFunctionCollapse.vue';

export type AppRouteNames = 'ImageToAscii' | 'WaveFunctionCollapse';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        alias: '/pages',
        redirect: '/imageToAscii',
        component: MainTemplate,
        children: [
            {
                name: 'ImageToAscii',
                path: 'imageToAscii',
                component: ImageToAscii,
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
