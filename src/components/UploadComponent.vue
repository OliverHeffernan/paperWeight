<!-- display the number of pages that have been captured. And provide buttons to upload, and remove photos -->
<!-- found in UploadView.vue -->
<script setup lang="ts">
import BubbleButton from '../components/BubbleButton.vue';

defineProps<{
    pageCount: integer;
}>();

defineEmits<{
    (e: 'uploadWorkoutData'): void;
    (e: 'retakePhoto'): void;
}>();
</script>
<template>
    <div v-if="pageCount > 0" id="urlsCount">
        pages {{ pageCount }}
        <BubbleButton
            label="Upload"
            :loading="false"
            @click="$emit('uploadWorkoutData')"
        />
        <BubbleButton
            label="Retake"
            :loading="false"
            @click="$emit('retakePhoto')"
        />
    </div>
</template>
<style scoped>
#urlsCount {
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: fixed;
    top: 70px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 16px;
	width: fit-content;
}
</style>
