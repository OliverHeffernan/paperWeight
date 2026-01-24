<script setup lang="ts">
const props = defineProps<{
    label: string;
    value: number;
    prevValue: number;
    dispValue: string;
    icon: string;
    selected: boolean;
}>();

const emit = defineEmits<{
    (e: 'click'): void;
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
    <div
        class="statBubble softBubble clickable"
        :class="{ selected: selected }"
        @click="$emit('click')"
    >
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
    opacity: 0.8;
    transition: all 0.3s ease;
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
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.statBubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(75, 192, 192, 0.1), transparent);
    transition: left 0.6s;
}

.statBubble:hover::before {
    left: 100%;
}

.statBubble:hover .right {
    opacity: 1;
    transform: scale(1.1);
}

.selected {
    border: solid 2px var(--btnBorder);
    background: linear-gradient(135deg, var(--sec) 0%, color-mix(in srgb, var(--accent) 10%, var(--sec)) 100%);
    box-shadow: 0 4px 15px rgba(75, 192, 192, 0.2);
}

.statBubble p {
    margin: 0;
    transition: color 0.3s ease;
}

.statBubble h2 {
    margin: 10px 0;
    font-weight: 700;
    font-size: 1.8rem;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.selected h2 {
    background: linear-gradient(135deg, var(--accent) 0%, var(--text) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
</style>
