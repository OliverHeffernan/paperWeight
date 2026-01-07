<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import HeartrateStream from '../../interfaces/HeartrateStream';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const isCreatingChart = ref<boolean>(false);
const chartId = ref<number>(0);

const props = defineProps<{
    heartrateStream: HeartrateStream;
    workoutDuration: number; // in minutes
}>();

onMounted(async() => {
    await nextTick();
    await createChart();
});

function destroyChart() {
    if (chartInstance.value) {
        try {
            chartInstance.value.tooltip.setActiveElements([], {x: 0, y: 0});
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
    if (!props.heartrateStream || !props.heartrateStream.data || props.heartrateStream.data.length === 0) {
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
    await new Promise(resolve => setTimeout(resolve, 50));

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

    // Prepare data for chart
    const hrData = props.heartrateStream.data;
    const timePerPoint = props.workoutDuration / hrData.length; // minutes per data point
    
    const xy_values = hrData.map((hr, index) => {
        const timeInMinutes = index * timePerPoint;
        return {
            x: timeInMinutes,
            y: hr
        };
    });
    
    // Get the computed styles of the root element
    const cssVar = getComputedStyle(document.documentElement);

    const data = {
        datasets: [{
            label: 'Heart Rate',
            data: xy_values,
            borderColor: '#fc4c02',
            backgroundColor: 'rgba(252, 76, 2, 0.1)',
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.1
        }]
    };

    const font_options = {
        family: 'Avenir',
        size: 14,
        color: cssVar.getPropertyValue('--text')
    };

    const font_options_title = {
        family: 'Avenir',
        size: 16,
        weight: '900',
        color: cssVar.getPropertyValue('--text')
    };

    // Configuration options
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 // Disable animations to prevent race conditions
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    bodyFont: font_options,
                    backgroundColor: cssVar.getPropertyValue('--sec'),
                    titleColor: cssVar.getPropertyValue('--text'),
                    bodyColor: cssVar.getPropertyValue('--text'),
                    borderColor: cssVar.getPropertyValue('--border'),
                    borderWidth: 1,
                    callbacks: {
                        title: function(context: any) {
                            const totalSeconds = context[0].parsed.x;
							const minutes = Math.floor(totalSeconds/60)
							const seconds = Math.floor(totalSeconds % 60);
                            
							return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        },
                        label: function(context: any) {
                            return `${context.parsed.y} BPM`;
                        }
                    }
                },
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Heart Rate During Workout',
                    font: font_options_title
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Time (minutes)',
                        font: font_options
                    },
                    ticks: {
                        font: font_options,
                        maxTicksLimit: 8,
                        callback: function(value: any) {
                            const totalMinutes = value;
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = Math.floor(totalMinutes % 60);
                            const seconds = Math.floor(((totalMinutes % 1) * 60));
                            
                            if (hours > 0) {
                                return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            } else {
                                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                            }
                        }
                    },
                    grid: {
                        color: cssVar.getPropertyValue('--border')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Heart Rate (BPM)',
                        font: font_options
                    },
                    ticks: {
                        font: font_options,
                        maxTicksLimit: 6
                    },
                    grid: {
                        color: cssVar.getPropertyValue('--border')
                    }
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
        console.error('Error creating heart rate chart:', error);
    } finally {
        isCreatingChart.value = false;
    }
}

watch(() => props.heartrateStream, async () => {
    await nextTick();
    await createChart();
}, { deep: true });

watch(() => props.workoutDuration, async () => {
    await nextTick();
    await createChart();
});
</script>

<template>
    <div class="heart-rate-chart">
        <canvas ref="canvasRef" class="chart-canvas"></canvas>
    </div>
</template>

<style scoped>
.heart-rate-chart {
    width: 100%;
    height: 300px;
    position: relative;
}

.chart-canvas {
    width: 100% !important;
    height: 100% !important;
}
</style>
