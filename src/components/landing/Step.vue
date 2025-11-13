<script setup lang="ts">
const props = defineProps<{
    stepNumber: number;
    title: string;
    message?: string;
    imgSrc?: string;
}>();
</script>
<template>
    <div class="margins">
        <div class="stepContainer">
            <div class="rows box">
                <div class="stepNumber">
                    {{ stepNumber }}
                </div>
                <div class="stepContent">
                    <h2>{{ title }}</h2>
                    <p v-if="message">{{ message }}</p>
                </div>
            </div>
            <div v-if="imgSrc" class="box2 box">
                <img :src="imgSrc" class="stepImage" />
            </div>
        </div>
    </div>
</template>
<style scoped>
.stepContainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    align-items: center;
    border: 1px solid var(--borderColor);
    background-color: var(--backgroundLight);
    margin-bottom: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

.margins {
    padding-bottom: 0;
}

.rows {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: left;
}

.box {
    max-width: 400px;
    flex-grow: 1;
}

.box2 {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: var(--sec);
    border-radius: 18px;
    border: 1px solid var(--border);
}

.box2 img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.stepNumber {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background-color: var(--sec);
}
</style>
