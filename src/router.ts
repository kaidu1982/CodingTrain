import type { RouteParams, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import MainTemplate from '@/layout/MainTemplate.vue';
import ImageToAscii from '@/pages/ImageToAscii.vue';
import WaveFunctionCollapse from '@/pages/WaveFunctionCollapse.vue';
import CameraToAscii from '@/pages/CameraToAscii.vue';
import AnimatedCirclePacking from '@/pages/AnimatedCirclePacking.vue';
import AnimatedCirclePackingColor from '@/pages/AnimatedCirclePackingColor.vue';
import Starfield from '@/pages/Starfield.vue';
import AStarPathFinding from '@/pages/AStarPathFinding.vue';
import FlockingSimulation from '@/pages/FlockingSimulation.vue';
import QuadTree from '@/pages/QuadTree.vue';
import QuadTreeParticleCollisions from '@/pages/QuadTreeParticleCollisions.vue';
import QuickSort from '@/pages/QuickSort.vue';
import RayCasting2D from '@/pages/RayCasting2D.vue';
import RenderingRayCasting from '@/pages/RenderingRayCasting.vue';
import SteeringBehaviors from '@/pages/SteeringBehaviors.vue';
import EvolutionarySteeringBehaviors from '@/pages/EvolutionarySteeringBehaviors.vue';

export type AppRouteNames =
    | 'EvolutionarySteeringBehaviors'
    | 'SteeringBehaviors'
    | 'RenderingRayCasting'
    | 'RayCasting2D'
    | 'QuickSort'
    | 'QuadTreeParticleCollisions'
    | 'QuadTree'
    | 'ImageToAscii'
    | 'AnimatedCirclePacking'
    | 'AnimatedCirclePackingColor'
    | 'CameraToAscii'
    | 'WaveFunctionCollapse'
    | 'Starfield'
    | 'AStarPathFinding'
    | 'FlockingSimulation';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        alias: '/pages',
        redirect: '/steeringBehaviors',
        component: MainTemplate,
        children: [
            {
                name: 'EvolutionarySteeringBehaviors',
                path: 'evolutionarySteeringBehaviors',
                component: EvolutionarySteeringBehaviors,
            },
            {
                name: 'SteeringBehaviors',
                path: 'steeringBehaviors',
                component: SteeringBehaviors,
            },
            {
                name: 'RenderingRayCasting',
                path: 'renderingRayCasting',
                component: RenderingRayCasting,
            },
            {
                name: 'RayCasting2D',
                path: 'rayCasting2D',
                component: RayCasting2D,
            },
            {
                name: 'QuickSort',
                path: 'quickSort',
                component: QuickSort,
            },
            {
                name: 'QuadTreeParticleCollisions',
                path: 'quadTreeParticleCollisions',
                component: QuadTreeParticleCollisions,
            },
            {
                name: 'QuadTree',
                path: 'quadTree',
                component: QuadTree,
            },
            {
                name: 'FlockingSimulation',
                path: 'flockingSimulation',
                component: FlockingSimulation,
            },
            {
                name: 'AStarPathFinding',
                path: 'aStarPathFinding',
                component: AStarPathFinding,
            },
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
