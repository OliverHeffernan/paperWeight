<template>
	<div class="settings-container">
		<div class="settings-content margins">
			<div class="settings-header">
				<h1 class="page-title">Settings</h1>
				<p class="page-subtitle">Manage your account and integrations</p>
			</div>

			<div class="settings-sections">
				<section class="settings-card">
					<div class="card-header">
						<div class="header-content">
							<i class="fa-brands fa-strava header-icon"></i>
							<div>
								<h3 class="card-title">Strava Integration</h3>
								<p v-if="!isStravaConnected" class="card-description">
									Connect your Strava account to automatically match your paperWeight workouts with Strava activities.
								</p>
								<p v-else class="card-description connected">
									<i class="fa-solid fa-check-circle"></i>
									Connected as: <strong>{{ stravaAthleteName }}</strong>
								</p>
							</div>
						</div>
					</div>

					<div class="card-actions">
						<BubbleButton 
							v-if="!isStravaConnected" 
							@click="handleConnectStrava"
							class="connect-button"
							strava
						></BubbleButton>

						<div v-else class="connected-actions">
							<BubbleButton @click="syncWorkouts" class="action-button" :disabled="isSyncing">
								<i class="fa-solid fa-sync" :class="{ 'spinning': isSyncing }"></i>
								{{ isSyncing ? 'Syncing...' : 'Sync Workouts' }}
							</BubbleButton>
							<BubbleButton @click="disconnectStrava" class="action-button danger">
								<i class="fa-solid fa-unlink"></i>
								Disconnect
							</BubbleButton>
						</div>
					</div>

					<div v-if="stravaMessage" class="status-message" :class="stravaMessageType">
						<i :class="stravaMessageType === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-triangle'"></i>
						{{ stravaMessage }}
					</div>
				</section>

				<section class="settings-card">
					<div class="card-header">
						<div class="header-content">
							<i class="fa-solid fa-user header-icon"></i>
							<div>
								<h3 class="card-title">Account</h3>
								<p class="card-description">Manage your account settings and sign out</p>
							</div>
						</div>
					</div>

					<div class="card-actions">
						<BubbleButton @click="signingOut = true" class="action-button danger">
							<i class="fa-solid fa-right-from-bracket"></i>
							Sign Out
						</BubbleButton>
					</div>
				</section>
			</div>
		</div>
	</div>

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

<style scoped>
.settings-container {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--prim) 0%, var(--sec) 20%);
	padding: 20px 0;
}

.settings-content {
	max-width: 800px;
	margin: 0 auto;
}

.settings-header {
	text-align: center;
	margin-bottom: 40px;
	padding: 30px 0;
}

.page-title {
	font-size: 2.5rem;
	font-weight: 700;
	margin: 0 0 10px 0;
	background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.page-subtitle {
	font-size: 1.1rem;
	opacity: 0.7;
	margin: 0;
	font-weight: 400;
}

.settings-sections {
	display: flex;
	flex-direction: column;
	gap: 25px;
}

.settings-card {
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	transition: all 0.3s ease;
	animation: slideUp 0.6s ease-out;
}

.settings-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
from {
	opacity: 0;
	transform: translateY(20px);
}
to {
	opacity: 1;
	transform: translateY(0);
}
}

.card-header {
	margin-bottom: 25px;
}

.header-content {
	display: flex;
	align-items: flex-start;
	gap: 20px;
}

.header-icon {
	font-size: 2rem;
	color: var(--accent);
	margin-top: 5px;
}

.card-title {
	font-size: 1.5rem;
	font-weight: 700;
	margin: 0 0 10px 0;
	color: var(--text);
}

.card-description {
	margin: 0;
	opacity: 0.8;
	line-height: 1.6;
	font-size: 1rem;
}

.card-description.connected {
	color: var(--goodBorder);
	font-weight: 600;
}

.card-description.connected i {
	margin-right: 8px;
}

.card-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
}

.connected-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	width: 100%;
}

.action-button {
	padding: 12px 20px;
	border-radius: 12px;
	font-weight: 600;
	transition: all 0.3s ease;
	flex: 1;
	min-width: 140px;
}

.action-button.danger {
	border-color: var(--errorBorder);
	background-color: var(--errorBG);
}

.action-button.danger:hover {
	background-color: color-mix(in srgb, var(--errorBG) 80%, var(--errorBorder) 20%);
}

.connect-button {
	padding: 15px 25px;
	border-radius: 15px;
	font-weight: 600;
}

.status-message {
	margin-top: 20px;
	padding: 15px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
}

.status-message.success {
	background-color: color-mix(in srgb, var(--goodBorder) 10%, transparent);
	border: 1px solid var(--goodBorder);
	color: var(--goodBorder);
}

.status-message.error {
	background-color: color-mix(in srgb, var(--errorBorder) 10%, transparent);
	border: 1px solid var(--errorBorder);
	color: var(--errorBorder);
}

.spinning {
	animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
	.page-title {
		font-size: 2rem;
	}

	.settings-card {
		padding: 25px 20px;
	}

	.header-content {
		flex-direction: column;
		gap: 15px;
		text-align: center;
	}

	.connected-actions {
		flex-direction: column;
	}

	.action-button {
		min-width: auto;
	}
}
</style>
<script setup lang="ts">
import OptionPopup from '../components/OptionPopup.vue';
import BubbleButton from '../components/BubbleButton.vue';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../lib/supabase';

const signingOut = ref<boolean>(false);
const isStravaConnected = ref<boolean>(false);
const stravaAthleteName = ref<string>('');
const isSyncing = ref<boolean>(false);
const stravaMessage = ref<string>('');
const stravaMessageType = ref<'success' | 'error'>('success');

const router = useRouter();
const route = useRoute();

async function signOut() {
	await supabase.auth.signOut();
	router.push({ name: "Sign In", params: { message: "signedout"} });
	signingOut.value = false;
}

async function checkStravaConnection() {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		const { data: profile, error } = await supabase
			.from('profiles')
			.select('strava_access_token, strava_athlete_name')
			.eq('id', user.id)
			.single();

		if (error) {
			console.error('Error fetching profile:', error);
			return;
		}

		if (profile?.strava_access_token) {
			isStravaConnected.value = true;
			stravaAthleteName.value = profile.strava_athlete_name || 'Strava User';
		}
	} catch (error) {
		console.error('Error checking Strava connection:', error);
	}
}

const handleConnectStrava = () => {
	const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID; // Public, safe to expose
	const redirectUri = 'https://gkyqqlkxpfskmtryfmyp.supabase.co/functions/v1/strava-callback'; 
	const scope = 'activity:read_all,profile:read_all'; 

	const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&approval_prompt=force&state=${crypto.randomUUID()}`;

	window.location.href = authUrl;
};

async function syncWorkouts() {
	try {
		isSyncing.value = true;
		stravaMessage.value = '';

		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			throw new Error('Not authenticated');
		}

		const response = await fetch(
			`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetchStrava`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			}
		);

		if (!response.ok) {
			throw new Error('Failed to sync workouts');
		}

		stravaMessage.value = 'Workouts synced successfully!';
		stravaMessageType.value = 'success';

		// Clear message after 3 seconds
		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);

	} catch (error) {
		console.error('Sync error:', error);
		stravaMessage.value = 'Failed to sync workouts. Please try again.';
		stravaMessageType.value = 'error';

		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);
	} finally {
		isSyncing.value = false;
	}
}

async function disconnectStrava() {
	try {
		// Show confirmation dialog
		if (!confirm('Are you sure you want to disconnect your Strava account? This will remove all Strava data from your workouts.')) {
			return;
		}

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			throw new Error('Not authenticated');
		}

		// Clear Strava data from the profile
		const { error: profileError } = await supabase
			.from('profiles')
			.update({
				strava_access_token: null,
				strava_refresh_token: null,
				strava_token_expires_at: null,
				strava_athlete_id: null,
				strava_athlete_name: null,
				strava_connected: false
			})
			.eq('id', user.id);

		if (profileError) {
			throw profileError;
		}

		// Clear Strava data from workouts
		const { error: workoutsError } = await supabase
			.from('workouts')
			.update({
				linked_strava_id: null,
				heartrate_stream: null
			})
			.eq('user_id', user.id)
			.not('linked_strava_id', 'is', null);

		if (workoutsError) {
			console.error('Error clearing workout Strava data:', workoutsError);
			// Don't fail the disconnect if this fails
		}

		// Update UI state
		isStravaConnected.value = false;
		stravaAthleteName.value = '';
		stravaMessage.value = 'Strava account disconnected successfully.';
		stravaMessageType.value = 'success';

		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);

	} catch (error) {
		console.error('Disconnect error:', error);
		stravaMessage.value = 'Failed to disconnect Strava account. Please try again.';
		stravaMessageType.value = 'error';

		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);
	}
}

onMounted(() => {
	checkStravaConnection();

	// Check for Strava callback messages
	const urlParams = new URLSearchParams(window.location.search);
	console.log('URL params on mount:', Object.fromEntries(urlParams.entries()));

	if (urlParams.get('strava_success')) {
		// Check if we have connection data in URL parameters
		const encodedData = urlParams.get('data');
		console.log('Encoded data from URL:', encodedData);

		if (encodedData) {
			try {
				const decodedData = atob(decodeURIComponent(encodedData));
				console.log('Decoded data:', decodedData);
				const connectionData = JSON.parse(decodedData);
				console.log('Parsed connection data:', connectionData);
				// Save the connection data to the user's profile
				saveStravaConnection(connectionData);
			} catch (error) {
				console.error('Error parsing connection data:', error);
				stravaMessage.value = 'Error processing Strava connection';
				stravaMessageType.value = 'error';
			}
		} else {
			// Fallback: check localStorage (for any existing data)
			const connectionDataStr = localStorage.getItem('strava_connection_data');
			console.log('Fallback localStorage data:', connectionDataStr);

			if (connectionDataStr) {
				try {
					const connectionData = JSON.parse(connectionDataStr);
					// Save the connection data to the user's profile
					saveStravaConnection(connectionData);
					// Clear the localStorage data
					localStorage.removeItem('strava_connection_data');
				} catch (error) {
					console.error('Error parsing connection data:', error);
					stravaMessage.value = 'Error processing Strava connection';
					stravaMessageType.value = 'error';
				}
			} else {
				console.warn('No connection data found in URL or localStorage');
				stravaMessage.value = 'Successfully connected to Strava!';
				stravaMessageType.value = 'success';
				checkStravaConnection(); // Refresh connection status
			}
		}
		// Clean up URL
		router.replace({ name: 'Settings' });
	} else if (urlParams.get('strava_error')) {
		const errorType = urlParams.get('strava_error');
		let errorMessage = 'Failed to connect to Strava';
		if (errorType === 'denied') {
			errorMessage = 'Strava connection was denied';
		} else if (errorType === 'no_code') {
			errorMessage = 'No authorization code received from Strava';
		} else if (errorType === 'config_missing') {
			errorMessage = 'Strava configuration is missing. Please contact support.';
		} else if (errorType === 'no_profile') {
			errorMessage = 'No user profile found. Please try logging out and back in.';
		}
		stravaMessage.value = errorMessage;
		stravaMessageType.value = 'error';
		// Clean up URL
		router.replace({ name: 'Settings' });
	}
});

async function saveStravaConnection(connectionData: any) {
	try {
		console.log('Saving Strava connection:', connectionData);

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			throw new Error('Not authenticated');
		}

		console.log('User ID:', user.id);

		// First, check if the user has a profile row
		const { data: existingProfile, error: fetchError } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', user.id)
			.single();

		console.log('Existing profile:', existingProfile, 'Fetch error:', fetchError);

		let updateError;

		if (!existingProfile) {
			// Create profile if it doesn't exist
			console.log('Creating new profile with Strava data...');
			const { error } = await supabase
				.from('profiles')
				.insert({
					id: user.id,
					strava_access_token: connectionData.strava_access_token,
					strava_refresh_token: connectionData.strava_refresh_token,
					strava_token_expires_at: connectionData.strava_token_expires_at,
					strava_athlete_id: connectionData.strava_athlete_id,
					strava_athlete_name: connectionData.strava_athlete_name,
					strava_connected: true,
				});
			updateError = error;
		} else {
			// Update existing profile
			console.log('Updating existing profile with Strava data...');
			const { error } = await supabase
				.from('profiles')
				.update({
					strava_access_token: connectionData.strava_access_token,
					strava_refresh_token: connectionData.strava_refresh_token,
					strava_token_expires_at: connectionData.strava_token_expires_at,
					strava_athlete_id: connectionData.strava_athlete_id,
					strava_athlete_name: connectionData.strava_athlete_name,
				})
				.eq('id', user.id);
			updateError = error;
		}

		if (updateError) {
			console.error('Database operation failed:', updateError);
			throw updateError;
		}

		console.log('Strava connection saved successfully');
		isStravaConnected.value = true;
		stravaAthleteName.value = connectionData.strava_athlete_name;
		stravaMessage.value = 'Successfully connected to Strava!';
		stravaMessageType.value = 'success';

		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);

	} catch (error) {
		console.error('Error saving Strava connection:', error);
		stravaMessage.value = `Failed to save Strava connection: ${error.message}`;
		stravaMessageType.value = 'error';
	}
}
</script>
