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
            <i class="fa-solid fa-right-from-bracket"></i>
        </button>
        <OptionPopup
            v-if="signingOut"
            title="Sign Out"
            message="Are you sure you want to sign out?"
            confirmText="Sign Out"
            confirmRed
            cancelText="Cancel"
            @confirm="signOut()"
            @cancel="signingOut = false"
        />
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
    if (route.name === "Home" || route.name === "Stats" || route.name === "Exercises" || route.name === "Upload" || route.name === "Sign In" || route.name === "Sign Up") {
        return false;
    }
    return window.history.length > 1;
}
</script>
