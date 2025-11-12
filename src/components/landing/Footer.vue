<script setup lang="ts">
import BubbleButton from '../../components/BubbleButton.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
    <footer class="footer margins">
        <h1>Sign Up for free today</h1>
        <BubbleButton
            @click="router.push({ name: 'Sign Up' })"
        >
            Get Started
        </BubbleButton>
        <div class="links">

        </div>
    </footer>
</template>
<style scoped>
.footer {
    text-align: center;
}
</style>
