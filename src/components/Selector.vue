<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import Option from '../interfaces/Option.ts';
const props = defineProps<{
    options: Array<Option>;
    colorSwap?: boolean;
}>();

//const emit = defineEmits(props.options.map(option => option.value));
const emit = defineEmits<{
    (e: 'select', value: string): void;
}>();

const value = ref<string>('');

onMounted(() => {
    if (props.options.length > 0) {
        value.value = props.options[0].value;
        //emit('select', value.value);
    }

});

</script>
<template>
    <div class="container">
        <div
            class="selector"
            :class="{ 'colorSwap': colorSwap }"
        >
            <div
                v-for="option in options"
                :key="option.value"
                :class="{
                    selectorOption: true,
                    clickable: true,
                    selected: option.value === value,
                    colorSwap: colorSwap
                }"
                @click="value = option.value; $emit('select', option.value)"
            >
                {{ option.label }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    overflow-x: auto;

}
.selector {
    display: flex;
    width: fit-content;
    gap: 4px;
    background-color: var(--sec);
    padding: 5px;
    border-radius: 30px;
}

.selector.colorSwap {
    background-color: var(--prim);
}

.selectorOption {
    padding: 8px 12px;
    border-radius: 30px;
    text-wrap: nowrap;
}

.selected {
    background-color: var(--prim);
}

.selected.colorSwap {
    background-color: var(--sec);
}
</style>
