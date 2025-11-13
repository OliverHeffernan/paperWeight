<script setup lang="ts">
import FeatureBubble from '../FeatureBubble.vue';
</script>
<template>
    <div class="container">
        <div class="marginsWidth featureSection">
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
        </div>
    </div>
</template>
<style scoped>
.container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
}
.featureSection {
    margin-top: 800px;
    background-color: var(--sec);
    z-index: 10;
    padding: 23px;
    border: solid var(--btnBorder) 1px;
    border-radius: 30px 30px 0 0;
    border-bottom: none;
    box-sizing: content-box;
}
.text-center {
    text-align: center;
}
.flexbox {
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    display: grid;
}
</style>
