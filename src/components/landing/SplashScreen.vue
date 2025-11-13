<script setup lang="ts">
import SignUpComponent from './SignUpComponent.vue';
</script>
<template>
    <div class="splash">
        <div class="margins">
            <h1>Your Workout Logs,<br><span style="color: var(--accent)">Digitized Instantly</span></h1>
            <p>Snap a photo of your workout notebook and let AI transform it into detailed digital logs. Track your progress, analyze your stats, and crush your personal bests.</p>
            <SignUpComponent />
        </div>
    </div>
    <div class="gradient"></div>
    <div class="splash-spacer"></div>
</template>
<style scoped>
.splash {
    text-align: center;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 2;
    justify-content: center;
}

.margins {
    animation-timeline: scroll();
    animation-name: heading;
    animation-range: 0% 50%;
    animation-duration: 1s;
}

.splash .margins {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.margins h1 {
    font-size: 50px;
    line-height: 1.1;
}

.margins p {
    animation-timeline: scroll();
    animation-name: heading;
    animation-range: 0% 50%;
    animation-duration: 1s;
    margin-bottom: 40px;
}

@keyframes heading {
    from {
        opacity: 1;
        filter: blur(0px);
    }
    to {
        scale: 1.5;
        opacity: 0;
        filter: blur(4px);

    }
}
.splash-spacer {
    height: 90vh;
    width: 100%;
}
.gradient {
    position: fixed;
    top: 0;
    height: 200vh;
    width: 100%;
    z-index: 1;
    background: radial-gradient(circle at center, var(--accent) 0%, var(--prim) 50%);
    animation-timeline: scroll();
    animation-name: gradient;
    animation-range: 0% 100%;
    animation-duration: 1s;
}

@keyframes gradient {
    from {
        height: 200vh;
        top: 0;
        opacity: 1;
    }
    to {
        height: 400vh;
        top: -130vh;
        opacity: 0;
    }
}
</style>
