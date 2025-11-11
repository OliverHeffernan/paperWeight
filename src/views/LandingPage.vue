<script setup lang="ts">
import FeatureBubble from '../components/FeatureBubble.vue';
import StepsSection from '../components/landing/StepsSection.vue';
import NavBar from '../components/landing/NavBar.vue';
</script>

<template>
    <div class="margins">
        <NavBar />
        <h1>Your Paper Logs,<br><span style="color: var(--accent)">Digitized Instantly</span></h1>
        <p>Snap a photo of your workout notebook and let AI transform it into detailed digital logs. Track your progress, analyze your stats, and crush your personal bests.</p>
        <h2>Everything You Need to Track your Progress</h2>
        <p>From paper to insights in seconds. PaperWeight transforms your analog logs into powerful digital analytics.</p>
        <div class="flexbox">
            <FeatureBubble
                title="Snap & Upload"
                message="Simply take a photo of your handwritten workout log. Our AI handles the rest."
                iconClass="fa-solid fa-camera"
            />
            <FeatureBubble
                title="AI-Powered Recognition"
                message="Our advanced AI accurately interprets your handwriting and workout details."
                iconClass="fa-solid fa-robot"
            />
            <FeatureBubble
                title="Overall Stats"
                message="Clearly visualize your progress with comprehensive statistics and trends."
                iconClass="fa-solid fa-chart-line"
            />
            <FeatureBubble
                title="Per-Exercise Stats"
                message="Dive deep into your performance with detailed stats for each exercise."
                iconClass="fa-solid fa-dumbbell"
            />
            <FeatureBubble
                title="Personal Bests"
                message="Easily track and celebrate your personal records over time."
                iconClass="fa-solid fa-medal"
            />
        </div>
        <StepsSection />
    </div>
</template>

<style scoped>
.text-center {
    text-align: center;
}
.flexbox {
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    display: grid;
}
</style>
