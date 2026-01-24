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

const loading: Ref<boolean> = ref<boolean>(false);
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

onMounted(() => {
    if (props.message === "signedout") {
        errorDisplay.value.setError("Signed Out", "You have been signed out successfully.");
        return;
    }

    if (props.message !== undefined && props.message.startsWith("emailconfirmed")) {
        errorDisplay.value.setError("Email Confirmed", "Your email has been confirmed. You can now sign in.");
        return;
    }
})

</script>

<template>
    <ErrorPopup :error="errorDisplay" notRed />
	<LoadingView v-if="loading" />
	<div class="signin-container">
        <div class="signin-card margins">
            <div class="signin-header">
                <h1 class="signin-title">Welcome Back</h1>
                <p class="signin-subtitle">Sign in to your account to continue tracking your fitness journey</p>
            </div>
            
            <form class="signin-form" @submit.prevent="handleSignIn">
                <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input 
                        id="email"
                        :ref="setInputRef" 
                        @keyup.enter="handleEnter(0)" 
                        v-model="email" 
                        type="email" 
                        placeholder="example@example.com"
                        class="form-input"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input 
                        id="password"
                        :ref="setInputRef" 
                        @keyup.enter="handleEnter(1)" 
                        v-model="password" 
                        type="password" 
                        placeholder="Enter your password"
                        class="form-input"
                        required
                    >
                </div>
                
                <BubbleButton 
                    :loading="loading" 
                    label="Sign In" 
                    @click="handleSignIn()" 
                    class="signin-button"
                    fullWidth
                />
            </form>
            
            <div class="signin-footer">
                <p class="signup-link">
                    <RouterLink :to="{ name: 'Sign Up' }" class="link-text">
                        Don't have an account? <span class="link-accent">Sign Up</span>
                    </RouterLink>
                </p>
            </div>
            
            <ErrorBubble :errorMsg="error" />
            <div v-if="success" class="success-message">You are now signed in.</div>
        </div>
    </div>
</template>

<style scoped>
.signin-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--prim) 0%, var(--sec) 100%);
    padding: 20px;
}

.signin-card {
    max-width: 450px;
    width: 100%;
    background: var(--sec);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.signin-header {
    text-align: center;
    margin-bottom: 30px;
}

.signin-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.signin-subtitle {
    font-size: 1rem;
    opacity: 0.7;
    margin: 0;
    line-height: 1.5;
}

.signin-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    opacity: 0.9;
}

.form-input {
    width: 100%;
    padding: 15px;
    font-size: 1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: var(--btnBG);
    color: var(--text);
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.form-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(75, 192, 192, 0.1);
    outline: none;
}

.form-input:hover {
    border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
}

.signin-button {
    margin-top: 10px;
    padding: 15px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
}

.signin-footer {
    text-align: center;
    margin-top: 25px;
}

.signup-link {
    margin: 0;
    font-size: 0.95rem;
}

.link-text {
    color: var(--text);
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.link-text:hover {
    opacity: 1;
}

.link-accent {
    color: var(--accent);
    font-weight: 600;
}

.success-message {
    text-align: center;
    color: var(--goodBorder);
    font-weight: 600;
    margin-top: 15px;
}

@media (max-width: 768px) {
    .signin-card {
        padding: 30px 25px;
        margin: 10px;
    }
    
    .signin-title {
        font-size: 2rem;
    }
    
    .form-input {
        padding: 12px;
    }
}
</style>
