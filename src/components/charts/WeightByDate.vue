<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import Set from '../classes/Set';
import Chart from 'chart.js/auto';
import { styling } from '../../utils/ChartUtils';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const isCreatingChart = ref<boolean>(false);
const chartId = ref<number>(0);

const props = defineProps<{
    sets: Array<{
        set: Set,
        date: Date,
    }>
}>();

onMounted(async() => {
    await nextTick();
    await createChart();
});

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
    if (!props.sets || props.sets.length === 0) {
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

    const xy_values = props.sets.map((object) => {
        return {
            y: object.set.getWeight(),
            x: object.date
        }
    });

    xy_values.sort((a, b) => a.x.getTime() - b.x.getTime());
    
    // Get the computed styles of the root element
    const cssVar = getComputedStyle(document.documentElement);

    const data = {
        datasets: [{
            label: '',
            data: xy_values,
            ...styling,
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
        type: 'line',
        data: data,
        options: {
            responsive: true,
            categoryPercentage: 1.0,
            animation: {
                duration: 0 // Disable animations to prevent race conditions
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false,
                    bodyFont: font_options

                },
                legend: {
                    display: false
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        time: {
                            tooltipFormat: 'MMM YYYY',
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM YYYY'
                            }
                        }
                    }
                },
                y: {
                    beginAtZero: false,
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


watch(() => props.sets, async (newWorkouts, oldWorkouts) => {
    
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
</script>

<template>
    <div class="softBubble">
        <canvas ref="canvasRef" id="weightByDateChart"></canvas>
    </div>
</template>
