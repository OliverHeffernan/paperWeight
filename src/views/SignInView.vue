<!-- Sign in page. -->
<script lang="ts" setup >

const props = defineProps<{
    message?: string;
}>();
// imports
import ErrorBubble from '../components/ErrorBubble.vue';
import LoadingView from './LoadingView.vue';
import BubbleButton from '../components/BubbleButton.vue';
import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

import { useRouter, RouterLink  } from 'vue-router';
import { ref, Ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

const router = useRouter();

const email: Ref<string> = ref<string>('');
const password: Ref<string> = ref<string>('');
const inputRefs = ref<Array<HTMLElement>>([]);

const setInputRef = (el: HTMLElement) => {
    if (el && !inputRefs.value.includes(el)) {
        inputRefs.value.push(el);
    }
};

function handleEnter(index: number) {
    if (index < inputRefs.value.length - 1) {
        inputRefs.value[index + 1].focus();
    } else {
        handleSignIn();
    }
}

const error: Ref<string | null> = ref<string | null>(null);

const loading: Ref<boolean> = ref<boolean>(true);
const success: Ref<boolean> = ref<boolean>(false);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

/**
 * Handle user sign-in.
 * If successful, redirect to home page.
 */
async function handleSignIn() {
	try {
		loading.value = true;
		error.value = null;
		success.value = false;

		const { data, error: signInError } = await supabase.auth.signInWithPassword({
			email: email.value,
			password: password.value,
		});

		if (signInError) throw signInError;

		success.value = true;
		router.push({ name: "Home" });
	} catch (err: any) {
		error.value = err.message || 'Failed to sign in. Please check your credentials.';
	} finally {
		loading.value = false;
	}
}

// Check if user is already signed in
async function checkUser() {
	const thing = await supabase.auth.getUser();
	if (!thing.data.user) {
		loading.value = false;
		return;
	}

	router.push({ name: "Home" });
}

onMounted(() => {
    if (props.message === "signedout") {
        errorDisplay.value.setError("Signed Out", "You have been signed out successfully.");
    }
})

checkUser();
</script>

<template>
    <ErrorPopup :error="errorDisplay" notRed />
	<LoadingView v-if="loading" />
	<div class="margins">
		<h2>Sign In</h2>
        <h3>Email</h3>
        <input :ref="setInputRef" @keyup.enter="handleEnter(0)" v-model="email" type="email" placeholder="example@example.com">
        <h3>Password</h3>
        <input :ref="setInputRef" @keyup.enter="handleEnter(1)" v-model="password" type="password" placeholder="password...">
        <BubbleButton :loading="loading" label="Sign In" @click="handleSignIn()" />
        <p><RouterLink :to="{ name: 'Sign Up' }">Don't have an account? Sign Up</RouterLink></p>

		<ErrorBubble :errorMsg="error" />
		<div v-if="success">You are now signed in.</div>
	</div>
</template>

<style scoped>
input {
	width: 100%;
}

.bubbleButton {
	margin-top: 10px;
}
</style>
