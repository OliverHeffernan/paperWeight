import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { supabase } from '../lib/supabase';

import SignInView from '../views/SignInView.vue';
import SignUpView from '../views/SignUpView.vue';
import EmailConfirmationView from '../views/EmailConfirmationView.vue';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import ViewWorkout from '../views/ViewWorkout.vue';
import StatsView from '../views/StatsView.vue';
import ExercisesView from '../views/ExercisesView.vue';
import ExerciseView from '../views/ExerciseView.vue';
import LandingPage from '../views/LandingPage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'landing',
        component: LandingPage,
    },
    {
        path: '/signin/:message?',
        name: 'Sign In',
        component: SignInView,
        props: true,
    },
    {
        path: '/signup',
        name: 'Sign Up',
        component: SignUpView,
    },
    {
        path: '/app/emailconf',
        name: 'Email Confirmation',
        component: EmailConfirmationView,
    },
    {
        path: '/app',
        name: 'Home',
        component: HomeView,
    },
    {
        path: '/app/upload',
        name: 'Upload',
        component: UploadView,
    },
    {
        path: '/app/view-workout/:workout_id',
        name: 'View Workout',
        component: ViewWorkout,
        props: true,
    },
    {
        path: '/app/exercise/:exercise_id',
        name: 'View Exercise',
        component: ExerciseView,
        props: true,
    },
    {
        path: '/app/stats',
        name: 'Stats',
        component: StatsView
    },
    {
        path: '/app/exercises',
        name: 'Exercises',
        component: ExercisesView
    },
    {
        path: '/email-confirmed',
        name: 'Email Confirmed',
        component: SignInView,
        props: { message: 'emailconfirmed' },
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const user = (await supabase.auth.getSession()).data.session;
    const isAuthRoute = to.path.startsWith('/app');
    const isSigningRoute = to.name === 'Sign In' || to.name === 'Sign Up' || to.name === 'Email Confirmation' || to.name === 'Email Confirmed';

    if (isAuthRoute && !user) {
        next({ name: 'Sign In' });
    } else if (isSigningRoute && user) {
        next({ name: 'Home' });
    } else {
        next();
    }
});

export default router;
