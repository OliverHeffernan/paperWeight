<template>
    <div class="backBar">
        <button v-if="canGoBack()" class="backButton clickable" @click="router.back()">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        <h3>{{ route.name }}</h3>
        <button
            v-if="!canGoBack() && route.name !== 'Sign In' && route.name !== 'Sign Up'"
            class="iconButton clickable signOutButton"
            @click="signingOut = true"
        >
            <!--<i class="fa-solid fa-right-from-bracket"></i>-->
			<i class="fa-solid fa-gear"></i>
        </button>
    </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import OptionPopup from './OptionPopup.vue';
import { supabase } from '../lib/supabase';
import { ref } from 'vue';

const signingOut = ref<boolean>(false);
const router = useRouter();
const route = useRoute();

async function signOut() {
    await supabase.auth.signOut();
    router.push({ name: "Sign In", params: { message: "signedout"} });
    signingOut.value = false;
}

function canGoBack(): boolean {
    if (route.name === "Home" || route.name === "Stats" || route.name === "Exercises" || route.name === "Upload") {
        return false;
    }
    return window.history.length > 1;
}
</script>
<style scoped>
.backBar {
    position: fixed;
    top: 0;
    top: env(safe-area-inset-top, 0);
    left: 0;
    width: 100vw;
    height: 60px;
    background-color: var(--sec);
    display: flex;
    align-items: center;
    padding-left: 10px;
    z-index: 10;
    border-bottom: solid 1px var(--border);
    box-sizing: border-box;
}

.backBar h3 {
    width: 100%;
    text-align: center;
}

.backButton {
    position: fixed;
    top: 17px;
    left: 20px;
    border: none;
    background: none;
    font-size: 15px;
}
</style>
