<template>
	<div class="settings-container">
		<h2>Settings</h2>
		
		<section class="strava-section">
			<h3>Strava Integration</h3>
			<p v-if="!isStravaConnected" class="description">
				Connect your Strava account to automatically match your paperWeight workouts with Strava activities.
			</p>
			<p v-else class="description connected">
				Connected as: {{ stravaAthleteName }}
			</p>
			
			<button 
				v-if="!isStravaConnected" 
				@click="handleConnectStrava"
				class="strava-connect-btn"
			>
				<i class="fab fa-strava"></i>
				Connect to Strava
			</button>
			
			<div v-else class="strava-actions">
				<button @click="syncWorkouts" class="sync-btn" :disabled="isSyncing">
					<i class="fa-solid fa-sync" :class="{ 'spinning': isSyncing }"></i>
					{{ isSyncing ? 'Syncing...' : 'Sync Workouts' }}
				</button>
				<button @click="disconnectStrava" class="disconnect-btn">
					<i class="fa-solid fa-unlink"></i>
					Disconnect
				</button>
			</div>
			
			<div v-if="stravaMessage" class="strava-message" :class="stravaMessageType">
				{{ stravaMessage }}
			</div>
		</section>
		
		<section class="account-section">
			<h3>Account</h3>
			<button class="signOutButton" @click="signingOut = true">
				<i class="fa-solid fa-right-from-bracket"></i>
				Sign Out
			</button>
		</section>
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
<script setup lang="ts">
import OptionPopup from '../components/OptionPopup.vue';
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

  console.log('Connecting to Strava with:', {
    clientId,
    redirectUri,
    scope
  });

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&approval_prompt=force&state=${crypto.randomUUID()}`;
  
  console.log('Auth URL:', authUrl);
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

<style scoped>
.settings-container {
	max-width: 600px;
	margin: 80px auto 20px;
	padding: 20px;
	color: var(--text);
}

.settings-container h2 {
	margin-bottom: 30px;
	color: var(--text);
}

section {
	margin-bottom: 40px;
	padding: 20px;
	background: var(--sec);
	border-radius: 10px;
	border: 1px solid var(--border);
}

section h3 {
	margin: 0 0 15px 0;
	color: var(--text);
	font-size: 1.1em;
}

.description {
	margin-bottom: 20px;
	color: var(--text-secondary);
	line-height: 1.5;
}

.description.connected {
	color: var(--success, #4CAF50);
	font-weight: 500;
}

.strava-connect-btn {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 24px;
	background: #fc4c02;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s;
}

.strava-connect-btn:hover {
	background: #e63900;
}

.strava-actions {
	display: flex;
	gap: 15px;
	flex-wrap: wrap;
}

.sync-btn {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: opacity 0.2s;
}

.sync-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.disconnect-btn {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	background: var(--danger, #dc3545);
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}

.disconnect-btn:hover {
	background: var(--danger-hover, #c82333);
}

.strava-message {
	margin-top: 15px;
	padding: 10px 15px;
	border-radius: 6px;
	font-weight: 500;
}

.strava-message.success {
	background: rgba(76, 175, 80, 0.1);
	color: var(--success, #4CAF50);
	border: 1px solid var(--success, #4CAF50);
}

.strava-message.error {
	background: rgba(220, 53, 69, 0.1);
	color: var(--danger, #dc3545);
	border: 1px solid var(--danger, #dc3545);
}

.signOutButton {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 20px;
	background: var(--danger, #dc3545);
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-size: 16px;
}

.signOutButton:hover {
	background: var(--danger-hover, #c82333);
}

.spinning {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
	.settings-container {
		margin: 80px 10px 20px;
	}
	
	.strava-actions {
		flex-direction: column;
	}
	
	.strava-connect-btn,
	.sync-btn,
	.disconnect-btn,
	.signOutButton {
		width: 100%;
		justify-content: center;
	}
}
</style>
