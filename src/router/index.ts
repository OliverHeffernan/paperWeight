import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import SignInView from '../views/SignInView.vue';
import SignUpView from '../views/SignUpView.vue';
import EmailConfirmationView from '../views/EmailConfirmationView.vue';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import ViewWorkout from '../views/ViewWorkout.vue';
import StatsView from '../views/StatsView.vue';
import ExercisesView from '../views/ExercisesView.vue';
import ExerciseView from '../views/ExerciseView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/signin',
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
        path: '/',
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
        path: '/exercise/:exercise_id',
        name: 'View Exercise',
        component: ExerciseView,
        props: true,
    },
    {
        path: '/stats',
        name: 'Stats',
        component: StatsView
    },
    {
        path: '/exercises',
        name: 'Exercises',
        component: ExercisesView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
