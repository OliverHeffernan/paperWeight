<script setup lang="ts">
import { supabase } from '../../lib/supabase';
import { onMounted } from 'vue';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import getWorkouts from '../../utils/getWorkouts';

onMounted(async () => {
    const workouts: Array<Workout> = await getWorkouts();
    workouts.reverse();
    const canvas = document.getElementById('workoutVolumeChart');

    const y_axis_values = workouts.map((workout) => workout.getVolume());
    const x_axis_values = workouts.map((workout) => workout.getStartTimeShortDateString());

    const xy_values = workouts.map((workout) => {
        return {
            x: workout.getStartTime(),
            y: workout.getVolume()
        }
    });

    const data = {
        datasets: [{
            label: 'My First Dataset',
            data: xy_values,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            tension: 0.0,
            showLine: true,
            pointRadius: 5,
        }]
    };

    const font_options = {
        family: 'Avenir',
        size: 16,
    };

    const font_options_title = {
        family: 'Avenir',
        size: 20,
        weight: '900',
        color: '#FFFFFF'
    };

    const root = document.documentElement;

    // Get the computed styles of the root element
    const cssVar = getComputedStyle(root);
    // Configuration options
    const config = {
        type: 'scatter',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Workout Volume (kg)',
                    font: font_options_title,
                    color: cssVar.getPropertyValue('--text'),
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return [
                                workouts[context.dataIndex].getTitle(),
                                `Volume: ${context.parsed.y} kg`,
                                `Date: ${new Date(context.parsed.x).toLocaleDateString()}`
                            ];
                        },
                    },
                    bodyFont: font_options

                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'week',
                        displayFormats: {
                            week: 'MMM d'
                        }
                    },
                    ticks: {
                        font: font_options
                    },
                },
                y: {
                    ticks: {
                        maxTicksLimit: 3,
                        font: font_options
                    },
                    position: 'right',
                    startAtZero: false,
                }
            }
        }
    };

    // Render the chart
    const myChart = new Chart(
        canvas,
        config
    );
});


</script>

<template>
    <div class="softBubble">
        <canvas id="workoutVolumeChart"></canvas>
    </div>
</template>

<style scoped>
</style>
