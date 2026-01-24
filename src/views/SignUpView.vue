<!-- Sign up view -->
<script setup lang="ts">

const props = defineProps<{
    email?: string;
}>();

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';
import ErrorBubble from '../components/ErrorBubble.vue';
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from './LoadingView.vue';
import { RouterLink } from 'vue-router';

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

onMounted(() => {
    if (props.email) {
        email.value = props.email;
    }
});

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
                    emailRedirectTo: "https://paperweight.olihef.com/email-confirmed"
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
	<div class="signup-container">
        <div class="signup-card margins">
            <div class="signup-header">
                <h1 class="signup-title">Create Account</h1>
                <p class="signup-subtitle">Join the paperWeights community and start tracking your fitness journey</p>
            </div>
            
            <form class="signup-form" @submit.prevent="signUpWithEmail">
                <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input 
                        id="email"
                        v-model="email" 
                        :ref="setInputRef" 
                        @keyup.enter="handleEnter(0)" 
                        type="email" 
                        placeholder="Enter your email"
                        class="form-input"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="displayname" class="form-label">Display Name</label>
                    <input 
                        id="displayname"
                        v-model="displayname" 
                        :ref="setInputRef" 
                        @keyup.enter="handleEnter(1)" 
                        type="text" 
                        placeholder="Enter your display name"
                        class="form-input"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input 
                        id="password"
                        v-model="password" 
                        :ref="setInputRef" 
                        @keyup.enter="handleEnter(2)" 
                        type="password" 
                        placeholder="Create a secure password"
                        class="form-input"
                        required
                    >
                </div>
                
                <BubbleButton 
                    :loading="loading" 
                    label="Create Account" 
                    @click="signUpWithEmail()" 
                    class="signup-button"
                    fullWidth
                />
            </form>
            
            <div class="signup-footer">
                <p class="signin-link">
                    <RouterLink :to="{ name: 'Sign In' }" class="link-text">
                        Already have an account? <span class="link-accent">Sign In</span>
                    </RouterLink>
                </p>
            </div>
            
            <ErrorBubble :errorMsg="errorMsg" />
        </div>
    </div>
</template>

<style scoped>
.signup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--prim) 0%, var(--sec) 100%);
    padding: 20px;
}

.signup-card {
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

.signup-header {
    text-align: center;
    margin-bottom: 30px;
}

.signup-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.signup-subtitle {
    font-size: 1rem;
    opacity: 0.7;
    margin: 0;
    line-height: 1.5;
}

.signup-form {
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

.signup-button {
    margin-top: 10px;
    padding: 15px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
}

.signup-footer {
    text-align: center;
    margin-top: 25px;
}

.signin-link {
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

@media (max-width: 768px) {
    .signup-card {
        padding: 30px 25px;
        margin: 10px;
    }
    
    .signup-title {
        font-size: 2rem;
    }
    
    .form-input {
        padding: 12px;
    }
}
</style>
