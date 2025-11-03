<script setup lang="ts">
import { onMounted, ref, watch, nextTick, onUnmounted } from 'vue';
import Workout from '../../classes/Workout';
import { Histogram, HistogramBinLabels } from '../../utils/Histogram';
import DataUtils from '../../utils/DataUtils';
import DateUtils from '../../utils/DateUtils';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const props = defineProps<{
    workouts: Array<Workout> | null;
    graphSize?: string;
    backTimes?: number;
    binSize?: string;
    whatGraphed: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const isCreatingChart = ref<boolean>(false);
const chartId = ref<number>(0);

function destroyChart() {
    if (chartInstance.value) {
        try {
            chartInstance.value.destroy();
        } catch (error) {
            console.warn('Error destroying chart:', error);
        }
        chartInstance.value = null;
    }
}

async function createChart() {
    if (!canvasRef.value) {
        return;
    }
    if (!props.workouts || props.workouts.length === 0) {
        return;
    }
    if (isCreatingChart.value) {
        return;
    }

    isCreatingChart.value = true;
    
    // Increment chart ID to invalidate any pending operations
    chartId.value++;
    const currentChartId = chartId.value;
    
    // Destroy existing chart instance if it exists
    destroyChart();

    // Wait a frame to ensure the canvas is ready
    await nextTick();
    
    // Check if we were superseded by another chart creation
    if (currentChartId !== chartId.value) {
        isCreatingChart.value = false;
        return;
    }

    // Double-check canvas is still available
    if (!canvasRef.value) {
        isCreatingChart.value = false;
        return;
    }

    const xy_values = props.workouts.map((workout) => {
        return {
            x: workout.getStartTime(),
            y: workout.getItem(props.whatGraphed)
        }
    });
    
    // Get the computed styles of the root element
    const cssVar = getComputedStyle(document.documentElement);


    // Store workouts data for tooltip callback to avoid reactivity issues
    const workoutsData = [...props.workouts];

    const data = {
        labels: HistogramBinLabels(xy_values, props.binSize, props.graphSize, props.backTimes),
        datasets: [{
            label: 'My First Dataset',
            data: Histogram(xy_values, props.binSize || 'day', props.graphSize, props.backTimes),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            borderRadius: 10,
            /*
            tension: 0.0,
            showLine: true,
            pointRadius: 5,
            */
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

    // Configuration options
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            categoryPercentage: 1.0,
            animation: {
                duration: 0 // Disable animations to prevent race conditions
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: DataUtils.fullNameForType(props.whatGraphed),
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
                                DataUtils.stringifyItem(context.parsed.y, props.whatGraphed),
                            ];
                        },
                    },
                    bodyFont: font_options

                }
            },
            scales: {
                /*
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
                */
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

    try {
        // Final check before creating chart
        if (currentChartId !== chartId.value || !canvasRef.value) {
            isCreatingChart.value = false;
            return;
        }

        // Render the chart
        const myChart = new Chart(
            canvasRef.value,
            config
        );
        
        // Only set the instance if we're still the current chart creation
        if (currentChartId === chartId.value) {
            chartInstance.value = myChart;
        } else {
            // We were superseded, destroy this chart
            myChart.destroy();
        }
    } catch (error) {
        console.error('Error creating chart:', error);
    } finally {
        isCreatingChart.value = false;
    }
}

function updateChartData() {
    if (!chartInstance.value || !props.workouts || props.workouts.length === 0) {
        return;
    }
    
    
    const xy_values = props.workouts.map((workout) => {
        return {
            x: workout.getStartTime(),
            y: workout.getVolume()
        }
    });
    
    // Update chart data without triggering Vue reactivity
    chartInstance.value.data.datasets[0].data = Histogram(xy_values, props.binSize, props.graphSize);
    chartInstance.value.data.labels = HistogramBinLabels(xy_values, props.binSize, props.graphSize, props.backTimes);
    chartInstance.value.update('none'); // Use 'none' mode for better performance
}

onMounted(async () => {
    await nextTick(); // Ensure DOM is ready
    createChart();
});

// Watch for changes in workouts prop and update chart accordingly
watch(() => props.workouts, async (newWorkouts, oldWorkouts) => {
    
    // Only update if the array reference actually changed
    if (newWorkouts === oldWorkouts) return;
    
    // Wait for any pending operations to complete
    await nextTick();
    
    // If we have no workouts, destroy existing chart
    if (!newWorkouts || newWorkouts.length === 0) {
        if (chartInstance.value) {
            chartInstance.value.destroy();
            chartInstance.value = null;
        }
        return;
    }
    
    // Always recreate the chart to avoid stale references and data issues
    await nextTick(() => createChart());
}, { 
    deep: false, // Don't watch deep changes - only array reference changes
    immediate: false // Don't run immediately since onMounted handles initial creation
});

watch(() => props.whatGraphed, async (newVal, oldVal) => {
    await nextTick();
    createChart();
});

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
    }
    isCreatingChart.value = false;
});


</script>

<template>
    <div class="softBubble">
        <canvas ref="canvasRef" id="workoutVolumeChart"></canvas>
    </div>
</template>

<style scoped>
</style>
