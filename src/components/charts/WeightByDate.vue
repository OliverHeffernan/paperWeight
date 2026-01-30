<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import Set from '../classes/Set';
import { styling } from '../../utils/ChartUtils';
import Selector from '../Selector.vue';
import Option from '../../interfaces/Option';
import GraphToolTip from '../GraphToolTip.vue';

const whatGraphed = ref<string>('weight');

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<any>(null);
const isCreatingChart = ref<boolean>(false);
const chartId = ref<number>(0);
const toolTipText = ref<Array<string> | null>(null);
const toolTipSet = ref<Set | null>(null);
const isLoading = ref<boolean>(true);

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

    const xy_values = props.sets.map((object) => {
        return {
            y: whatGraphed.value === "volume" ? object.set.getVolume() : object.set.getWeight(),
            x: object.date,
            set: object.set,
            graphed: whatGraphed.value
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
            trendlineExponential: {
                colorMin: cssVar.getPropertyValue('--accentTransparent'),
                colorMax: cssVar.getPropertyValue('--accentTransparent'),
                lineStyle: "solid",
                width: 2,
            }
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
        color: cssVar.getPropertyValue('--text')
    };

    // Configuration options
    const config = {
        type: 'scatter',
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
                    intersect: false,
                    bodyFont: font_options,
                    backgroundColor: 'rgba(0,0,0,0)',
                    titleColor: 'rgba(0,0,0,0)',
                    bodyColor: 'rgba(0,0,0,0)',
                    footerColor: 'rgba(0,0,0,0)',
                    displayColors: false,
                    callbacks: {
                        label: function(context: any) {
                            if (!context.parsed) return '';
                            const set: Set = context.raw.set as Set;
                            toolTipSet.value = set;
                            if (context.raw.graphed === 'volume') {
                                const date = new Date(context.parsed.x);
                                const volume = context.parsed.y;

                                toolTipText.value = [
                                    `${volume} kgs`,
                                    `${set.getReps()} x ${set.getWeight()} kgs`,
                                    `${date.toLocaleDateString()}`,
                                    "click to view the workout"
                                ];
                                return;
                            }
                            const date = new Date(context.parsed.x);
                            const weight = context.parsed.y;
                            toolTipText.value = [
                                `${date.toLocaleDateString()}: ${weight} kgs`,
                                "click to view the workout"
                            ];
                        }
                    }
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        tooltipFormat: 'd MMM yyyy',
                        unit: 'day',
                        displayFormats: {
                            month: 'MMM yyyy',
                            day: 'MMM d',
                            hour: 'MMM d'
                        }
                    },
                    ticks: {
                        font: font_options,
                        maxTicksLimit: 5,
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        font: font_options,
                        maxTicksLimit: 5,
                    }
                }
            }
        }
    };

    try {
        // Final check before creating chart
        if (currentChartId !== chartId.value || !canvasRef.value) {
            isCreatingChart.value = false;
            isLoading.value = false;
            return;
        }

        // Dynamically import Chart.js and trendline plugin
        const [{ default: Chart }, { default: chartTrendline }] = await Promise.all([
            import('chart.js/auto'),
            import('chartjs-plugin-trendline')
        ]);

        // Register the trendline plugin
        Chart.register(chartTrendline);

        // Render the chart
        const myChart = new Chart(
            canvasRef.value,
            config
        );
        
        // Only set the instance if we're still the current chart creation
        if (currentChartId === chartId.value) {
            chartInstance.value = myChart;
            isLoading.value = false;
        } else {
            // We were superseded, destroy this chart
            myChart.destroy();
        }
    } catch (error) {
        console.error('Error creating chart:', error);
        isLoading.value = false;
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

watch(() => whatGraphed.value, async (newVal, oldVal) => {
    await nextTick();
    createChart();
});
</script>

<template>
    <GraphToolTip
        :content="toolTipText"
        :set="toolTipSet"
    />
    <div class="softBubble">
        <Selector
            :options="[
                { label: 'Weight', value: 'weight' },
                { label: 'Volume', value: 'volume' }
            ]"
            colorSwap
            @select="whatGraphed = $event as string"
        />
        <canvas ref="canvasRef" id="weightByDateChart"></canvas>
    </div>
</template>

<style scoped>

</style>
