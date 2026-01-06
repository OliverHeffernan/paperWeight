<template>
	<button class="signOutButton" @click="signingOut = true">
		Sign Out
	</button>
	<button @click="handleConnectStrava">Connect to Strava</button>
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
</template>
<script setup lang="ts">
import OptionPopup from './OptionPopup.vue';
import { ref } from 'vue';

const signingOut = ref<boolean>(false);
const router = useRouter();

async function signOut() {
    await supabase.auth.signOut();
    router.push({ name: "Sign In", params: { message: "signedout"} });
    signingOut.value = false;
}

const handleConnectStrava = () => {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID; // Public, safe to expose
  const redirectUri = encodeURIComponent('https://gkyqqlkxpfskmtryfmyp.supabase.co/functions/v1/strava-callback'); // Or your app URL
  const scope = 'activity:read_all,profile:read_all'; // Adjust as needed

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&approval_prompt=force&state=${crypto.randomUUID()}`;

  window.location.href = authUrl;
};
</script>
