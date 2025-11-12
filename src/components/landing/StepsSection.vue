<script setup lang="ts">
import Step from "./Step.vue";
import WorkoutLogImage from "../../assets/workout_log.jpeg";
import WorkoutLogsImage from "../../assets/workout_logs.png";
import StatsScreenImage from "../../assets/stats_screen.png";

const steps = [
    {
        title: "Do your workout",
        message: "You can log your workout in any format on paper. Take a photo through the upload page.",
        imgSrc: WorkoutLogImage
    },
    {
        title: "View your logs",
        message: "View all of your workouts in the home screen.",
        imgSrc: WorkoutLogsImage
    },
    {
        title: "Track your progress",
        message: "Track your progress through stats such as volume, energy, and workout counts in the stats page.",
        imgSrc: StatsScreenImage
    }
];
</script>
<template>
    <div class="fullWidth">
        <div class="margins">
            <h1>How It Works</h1>
            <p>Three simple steps from paper to progress tracking</p>
            <Step
                v-for="(step, index) in steps"
                :key="index"
                :stepNumber="index + 1"
                :title="step.title"
                :message="step.message"
                :imgSrc="step.imgSrc"
            />
        </div>
    </div>
</template>

<style scoped>
.margins {
    position: relative;
    z-index: 10;
    background-color: var(--prim);
}
.fullWidth {
    margin: 0;
    width: 100%;
    border-top: 1px solid var(--border);
    position: relative;
    z-index: 10;
}
</style>
