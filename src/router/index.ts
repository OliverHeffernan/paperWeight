import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import SignInView from '../views/SignInView.vue';
import SignUpView from '../views/SignUpView.vue';
import EmailConfirmationView from '../views/EmailConfirmationView.vue';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import ViewWorkout from '../views/ViewWorkout.vue';
import StatsView from '../views/StatsView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'SignIn',
        component: SignInView,
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUpView,
    },
    {
        path: '/emailconf',
        name: 'Email Confirmation',
        component: EmailConfirmationView,
    },
    {
        path: '/home',
        name: 'Home',
        component: HomeView,
    },
    {
        path: '/upload',
        name: 'Upload',
        component: UploadView,
    },
    {
        path: '/viewWorkout/:workout_id',
        name: 'View Workout',
        component: ViewWorkout,
        props: true,
    },
    {
        path: '/stats',
        name: 'Stats',
        component: StatsView
    }

];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
