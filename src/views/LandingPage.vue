<script setup lang="ts">
import NavBar from '../components/landing/NavBar.vue';
import SplashScreen from '../components/landing/SplashScreen.vue';
import FeatureSection from '../components/landing/FeatureSection.vue';
import StepsSection from '../components/landing/StepsSection.vue';
import Footer from '../components/landing/Footer.vue';
</script>

<template>
    <NavBar />
    <SplashScreen />
    <FeatureSection />
    <div class="bg">
        <StepsSection />
        <Footer />
    </div>
</template>

<style scoped>
.margins {
    margin-top: 0;
    margin-bottom: 0;
}
.bg {
    background-color: var(--prim);
    position: relative;
    z-index: 10;
}
</style>
