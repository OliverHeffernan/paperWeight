<script setup lang="ts">
import BubbleButton from './BubbleButton.vue';
defineProps<{
    title: string;
    message?: string;
    confirmText: string;
    confirmRed?: boolean;
    cancelText: string;
    cancelRed?: boolean;
}>();

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();
</script>
<template>
    <div class="popupOverlay">
        <div class="popupContainer softBubble">
            <h2>{{ title }}</h2>
            <p>
                {{ message }}
                <slot></slot>
            </p>
            <div class="buttonContainer">
                <BubbleButton
                    :label="confirmText"
                    :red="confirmRed || false"
                    :loading="false"
                    @click="$emit('confirm')"
                />
                <BubbleButton
                    :label="cancelText"
                    :red="cancelRed || false"
                    :loading="false"
                    @click="$emit('cancel')"
                />
            </div>
        </div>
    </div>
</template>
<style scoped>
.popupOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

h2 {
    margin: 0;
    border-bottom: solid 1px var(--btnBorder);
    padding: 10px;
}

p {
    margin: 0;
    padding: 10px;
}

.buttonContainer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: solid 1px var(--btnBorder);
    padding: 5px;
}

.softBubble {
    padding: 0;
    border-color: var(--btnBorder);
    background-color: var(--btnBG);
}

.popupContainer {
    max-width: 90vw;
}
</style>
