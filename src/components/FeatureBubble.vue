<script setup lang="ts">
defineProps<{
    title: string;
    message: string;
    iconClass?: string;
}>();
</script>
<template>
    <div class="featureBubble softBubble">
        <h2>
            <i 
                v-if="iconClass"
                :class="iconClass"
                style="margin-right: 10px;"
            ></i>
            {{ title }}
        </h2>
        <p>
            {{ message }}
            <slot></slot>
        </p>
    </div>
</template>
<style scoped>
.featureBubble {
    display: block;
}
</style>
