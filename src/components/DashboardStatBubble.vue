<script setup lang="ts">
const props = defineProps<{
    label: string;
    value: number;
    prevValue: number;
    dispValue: string;
    icon: string;
}>();

function getChangePercentage(): string {
    if (props.prevValue == 0) {
        return 'N/A';
    }
    let change = ((props.value - props.prevValue) / props.prevValue) * 100;
    if (change < 0) change *= -1;
    return change.toFixed(1);
}
</script>
<template>
    <div class="statBubble softBubble">
        <p>
            {{ label }}
            <i class="right fa-solid" :class="icon"></i>
        </p>
        <h2>{{ dispValue }}</h2>
        <p v-if="prevValue !== 0">
            <i
                v-if="value !== prevValue"
                class="fa-solid"
                :class="value - prevValue >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"
            ></i>
            {{ getChangePercentage() }} %
        </p>
    </div>
</template>

<style scoped>
.right {
    float: right;
    font-size: 22px;
}

.fa-arrow-down {
    color: var(--errorBorder);
}

.fa-arrow-up {
    color: var(--goodBorder);
}

.statBubble {
    min-width: 200px;
    flex-grow: 1;
    height: 150px;
}
</style>
