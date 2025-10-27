<!-- Sign in page. -->
<script lang="ts" setup >
// imports
import ErrorBubble from '../components/ErrorBubble.vue';
import LoadingView from './LoadingView.vue';
import BubbleButton from '../components/BubbleButton.vue';

import { useRouter, RouterLink  } from 'vue-router';
import { ref, Ref } from 'vue';
import { supabase } from '../lib/supabase';

const router = useRouter();

const email: Ref<string> = ref<string>('');
const password: Ref<string> = ref<string>('');
const error: Ref<string | null> = ref<string | null>(null);

const loading: Ref<boolean> = ref<boolean>(true);
const success: Ref<boolean> = ref<boolean>(false);

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

checkUser();
</script>

<template>
	<LoadingView v-if="loading" />
	<div class="margins">
		<h2>Sign In</h2>
		<h3>Email</h3>
		<input v-model="email" type="email" placeholder="example@example.com">
		<h3>Password</h3>
		<input v-model="password" type="password" placeholder="password...">
        <BubbleButton :loading="loading" label="Sign In" @click="handleSignIn()" />
        <p><RouterLink :to="{ name: 'SignUp' }">Don't have an account? Sign Up</RouterLink></p>

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
