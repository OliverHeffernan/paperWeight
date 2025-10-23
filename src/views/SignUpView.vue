<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import ErrorBubble from '../components/ErrorBubble.vue';
import LoadingView from './LoadingView.vue';

const router = useRouter();

const displayname = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

async function signUpWithEmail() {
	try {
		loading.value = true;
		const { error } = await supabase.auth.signUp({
			email: email.value,
			password: password.value,
			options: {
				data: {
					display_name: displayname.value,
				},
			},
		});
		if (error) throw error;
		router.push({ name: 'Email Confirmation' });
	} catch (error) {
		errorMsg.value = error.message;
	} finally {
		loading.value = false;
	}
}
</script>
<template>
	<LoadingView v-if="loading" />
	<div class="margins">
		<h2>Sign Up</h2>
		<h3>Display name</h3>
        <input v-model="displayname" type="text" placeholder="Enter your display name.">
		<h3>Email</h3>
		<input v-model="email" type="email" placeholder="Enter your email.">
		<h3>Password</h3>
		<input v-model="password" type="password" placeholder="Enter the password you would like to use.">
		<button class="bubbleButton" :disabled="loading" @click="signUpWithEmail">Sign Up</button>

		<ErrorBubble :errorMsg="errorMsg" />
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
