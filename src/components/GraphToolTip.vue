<script setup lang="ts">
import { useRouter } from 'vue-router';
import Set from '../classes/Set';
const router = useRouter();
const props = defineProps<{
    content: Array<string> | null;
    set?: Set | null;
}>();
import { ref, onMounted, onUnmounted, watch } from 'vue';
const display = ref<boolean>(false);
const mouseX = ref<number>(0);
const mouseY = ref<number>(0);
const tooltipRef = ref<HTMLElement | null>(null);
let mouseXStart = 0;
let mouseYStart = 0;

function getTooltipX(): number {
    if (tooltipRef.value) {
        const tooltipWidth = tooltipRef.value.offsetWidth;
        if (mouseX.value + 15 + tooltipWidth > window.innerWidth) {
            return mouseX.value - 15 - tooltipWidth;
        }
    }
    return mouseX.value + 15;
}

function getTooltipY(): number {
    if (tooltipRef.value) {
        const tooltipHeight = tooltipRef.value.offsetHeight;
        if (mouseY.value + 15 + tooltipHeight > window.innerHeight) {
            return mouseY.value - 15 - tooltipHeight;
        }
    }
    return mouseY.value + 15;
}

watch(() => props.content, (newContent, oldContent) => {
    mouseXStart = mouseX.value;
    mouseYStart = mouseY.value;
    display.value = true;
});

function handleMouseMove(event: MouseEvent) {
    mouseX.value = event.clientX;
    mouseY.value = event.clientY;

    if (Math.abs(mouseX.value - mouseXStart) > 10 || Math.abs(mouseY.value - mouseYStart) > 10) {
        display.value = false;
        return;
    }
    if (Math.abs(mouseX.value - mouseXStart) < 2.5 || Math.abs(mouseY.value - mouseYStart) > 2.5) {
        display.value = true;
    }
}

function handleClick(event: MouseEvent) {
    if (display.value) {

        router.push({
            name: 'View Workout',
            params: { workout_id: props.set ? props.set.getWorkoutId() : null }
        });
        return;
    }
    handleMouseMove(event);
}

onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
});

onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('click', handleClick);
});

</script>
<template>
    <div
        v-if="content && display"
        ref="tooltipRef"
        class="graph-tooltip"
        :style="{
            left: getTooltipX() + 'px',
            top: getTooltipY() + 'px'
        }"
    >
        <p v-for="(line, index) in content" :key="index" style="margin: 0;">
            {{ line }}
        </p>
    </div>
</template>
<style scoped>
.graph-tooltip {
    position: fixed;
    background-color: var(--prim);
    color: var(--text);
    padding: 6px 10px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    pointer-events: none;
    z-index: 1000;
}
</style>
