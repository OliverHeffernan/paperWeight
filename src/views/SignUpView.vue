<!-- Sign up view -->
<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import ErrorBubble from '../components/ErrorBubble.vue';
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from './LoadingView.vue';

const router = useRouter();

const displayname = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const inputRefs = ref([]);

const setInputRef = (el) => {
    if (el && !inputRefs.value.includes(el)) {
        inputRefs.value.push(el);
    }
};

function handleEnter(index) {
    if (index < inputRefs.value.length - 1) {
        inputRefs.value[index + 1].focus();
    } else {
        signUpWithEmail();
    }
}

/**
 * Sign up with email and password.
 * On success, redirect to email confirmation view.
 */
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
        <input v-model="displayname" :ref="setInputRef" @keyup.enter="handleEnter(0)" type="text" placeholder="Enter your display name.">
		<h3>Email</h3>
		<input v-model="email" :ref="setInputRef" @keyup.enter="handleEnter(1)" type="email" placeholder="Enter your email.">
		<h3>Password</h3>
		<input v-model="password" :ref="setInputRef" @keyup.enter="handleEnter(2)" type="password" placeholder="Enter the password you would like to use.">
		<!--<button class="bubbleButton" :disabled="loading" @click="signUpWithEmail">Sign Up</button>-->
        <BubbleButton :loading="loading" label="Sign Up" @click="signUpWithEmail()" />

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
