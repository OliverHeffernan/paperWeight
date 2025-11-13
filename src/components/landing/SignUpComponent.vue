<script setup lang="ts">
import BubbleButton from "../BubbleButton.vue";
import { ref } from "vue";
import { useRouter } from 'vue-router';
const router = useRouter();

const email = ref<string>('');
</script>
<template>
    <div class="container">
        <input 
            type="text" 
            placeholder="Enter your email" 
            class="input-field"
            v-model="email"
        />
        <BubbleButton
            class="sign-up-button"
            @click="router.push({ name: 'Sign Up', params: { email: email } })"
        >
            Sign up for <b>Paper</b><em>Weight</em>
        </BubbleButton>
    </div>
</template>
<style scoped>

.container {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    margin-top: 20px;
    padding: 10px;
    margin: 0;
    width: 100%;
    max-width: 450px;

    background-color: white;
    border-radius: 20px;
}

.container .input-field {
    margin: 0;
    border: none;
    background: none;
    flex-grow: 1;
    color: black;
}

</style>
