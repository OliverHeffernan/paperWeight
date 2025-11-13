<script setup lang="ts">
import BubbleButton from '../../components/BubbleButton.vue';
import SignUpComponent from './SignUpComponent.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
    <footer class="footer">
        <div class="margins">
            <h1>Sign Up for free today</h1>
            <SignUpComponent />
            <div class="links">

            </div>
        </div>
        <div class="gradient"></div>
    </footer>
</template>
<style scoped>
.footer {
    text-align: center;
    position: relative;
    padding: 100px 0;
    overflow: hidden;
}

.footer .margins {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.gradient {
    height: 100vh;
    width: 100%;
    background: radial-gradient(circle at bottom, var(--accent) 0%, var(--prim) 60%);
    position: absolute;
    bottom: -400px;
    left: 0;
    z-index: 1;
}
</style>
