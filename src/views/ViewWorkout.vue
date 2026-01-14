<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import Workout from '../classes/Workout';
import LoadingView from '../views/LoadingView.vue';
import WorkoutOverview from '../components/WorkoutOverview.vue';
import ExerciseContainer from '../components/ExerciseContainer.vue';
import SavingDisplay from '../components/SavingDisplay.vue';
import BubbleButton from '../components/BubbleButton.vue';
import WorkoutDetailsEditModal from '../components/WorkoutDetailsEditModal.vue';
import HeartRateChart from '../components/charts/HeartRateChart.vue';

import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

const props = defineProps(['workout_id']);

const workout = ref<Workout | null>(null);
const showSets = ref<boolean>(true);
const loading = ref<boolean>(true);
const weightPbSets = ref<Array<string>>([]);
const volumePbSets = ref<Array<string>>([]);

const editingDetails = ref<boolean>(false);
const isSyncingStrava = ref<boolean>(false);
const stravaMessage = ref<string>('');
const stravaMessageType = ref<'success' | 'error'>('success');
const showHeartRateChart = ref<boolean>(false);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

onMounted(async () => {
    const fetch = await Workout.fetchById(props.workout_id);
    workout.value = fetch.workout;
    loading.value = false;
	console.log(workout.value);

    const weightPbsRequest = await supabase
        .rpc('get_weight_pbs', { pb_exercise_ids: await workout.value.getExerciseIds() });
    if (weightPbsRequest.error) {
        console.error('Error fetching weight PBs:', weightPbsRequest.error);
        return;
    }
    if (weightPbsRequest.data && Array.isArray(weightPbsRequest.data)) {
        weightPbSets.value = weightPbsRequest.data.map((item: any) => item.id);
    }

    const volumePbsRequest = await supabase
        .rpc('get_volume_pbs', { pb_exercise_ids: await workout.value.getExerciseIds() });
    if (volumePbsRequest.error) {
        console.error('Error fetching volume PBs:', volumePbsRequest.error);
        return;
    }
    if (volumePbsRequest.data && Array.isArray(volumePbsRequest.data)) {
        volumePbSets.value = volumePbsRequest.data.map((item: any) => item.id);
    }

    // Check Strava connection
    await checkStravaConnection();
});

// Check if user has Strava connected
const isStravaConnected = ref<boolean>(false);
const checkStravaConnection = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('strava_access_token')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return;
        }

        if (profile?.strava_access_token) {
            isStravaConnected.value = true;
        }
    } catch (error) {
        console.error('Error checking Strava connection:', error);
    }
};

// Sync this specific workout with Strava
const syncWorkoutWithStrava = async () => {
    if (!workout.value) return;

    try {
        isSyncingStrava.value = true;
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
                body: JSON.stringify({ workout_id: workout.value.workout_id }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to sync workout');
        }

        const result = await response.json();
        console.log('Sync result:', result);

        if (result.linkedActivity) {
            stravaMessage.value = 'Workout synced successfully with Strava!';
            stravaMessageType.value = 'success';

            // Refresh workout data to show updated Strava info
            const fetch = await Workout.fetchById(props.workout_id);
            workout.value = fetch.workout;
        } else {
            stravaMessage.value = 'No matching Strava activity found for this workout.';
            stravaMessageType.value = 'error';
        }

        // Clear message after 3 seconds
        setTimeout(() => {
            stravaMessage.value = '';
        }, 3000);

    } catch (error) {
        console.error('Sync error:', error);
        stravaMessage.value = 'Failed to sync workout. Please try again.';
        stravaMessageType.value = 'error';

        setTimeout(() => {
            stravaMessage.value = '';
        }, 3000);
    } finally {
        isSyncingStrava.value = false;
    }
};



</script>
<template>
    <error-popup :error="errorDisplay" />
    <WorkoutDetailsEditModal
        v-if="editingDetails && workout"
        :workout="workout"
        @cancel="editingDetails = false"
    />

    <div class="viewArea" v-if="workout">
        <div class="margins">
            <h2>
                {{ workout.getTitle() }}
                <i class="fa-solid fa-ellipsis clickable" @click="editingDetails = true"></i>
            </h2>
            <p class="greyed">{{ workout.getDateString() }}</p>
            <p class="softBubble" v-if="workout.getNotes() !== ''">{{ workout.getNotes() }}</p>
            <WorkoutOverview :workout="workout" />
            <!-- Heart Rate Chart Section -->
            <div v-if="workout.getHeartrateStream()" class="heart-rate-section">
                <BubbleButton
                    @click="showHeartRateChart = !showHeartRateChart"
                    fullWidth
                >
                    <i class="fa-solid fa-heart" style="color: #fc4c02;"></i>
                    {{ showHeartRateChart ? 'Hide Heart Rate Chart' : 'Show Heart Rate Chart' }}
                </BubbleButton>
                
                <div v-if="showHeartRateChart" class="heart-rate-chart-container">
                    <HeartRateChart 
                        :heartrate-stream="workout.getHeartrateStream()!"
                        :workout-duration="workout.getDuration()"
                    />
                    
                    <!-- Heart Rate Stats -->
                    <div class="hr-stats">
                        <div class="hr-stat">
                            <div class="label">Average</div>
                            <div class="value">{{ Math.round(workout.getHeartrateStream()!.data.reduce((a, b) => a + b, 0) / workout.getHeartrateStream()!.data.length) }} BPM</div>
                        </div>
                        <div class="hr-stat">
                            <div class="label">Maximum</div>
                            <div class="value">{{ Math.max(...workout.getHeartrateStream()!.data) }} BPM</div>
                        </div>
                        <div class="hr-stat">
                            <div class="label">Minimum</div>
                            <div class="value">{{ Math.min(...workout.getHeartrateStream()!.data) }} BPM</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <BubbleButton
                @click="showSets = !showSets"
                fullWidth
            >
                <i class="fa-solid" :class="showSets ? 'fa-eye-slash' : 'fa-eye'"></i>
                {{ showSets ? 'Hide Sets' : 'Show Sets' }}
            </BubbleButton>
            
            <!-- Strava Sync Button -->
            <BubbleButton
                v-if="isStravaConnected && !workout.linked_strava_id"
                @click="syncWorkoutWithStrava"
                :disabled="isSyncingStrava"
                fullWidth
                class="strava-sync-btn"
            >
                <i class="fab fa-strava" v-if="!isSyncingStrava"></i>
                <i class="fa-solid fa-spinner fa-spin" v-else></i>
                {{ isSyncingStrava ? 'Syncing...' : 'Sync with Strava' }}
            </BubbleButton>
            
            <!-- Strava Status -->
            <div v-if="workout.linked_strava_id" class="strava-status">
                <i class="fab fa-strava"></i>
                <span>Linked to Strava Activity</span>
                <span class="activity-id">#{{ workout.linked_strava_id }}</span>
            </div>
            
            <!-- Sync Message -->
            <div v-if="stravaMessage" class="sync-message" :class="stravaMessageType">
                {{ stravaMessage }}
            </div>
            <ExerciseContainer
                v-for="(exercise, index) in workout.getExercises()"
                :key="exercise.getName()"
                :exercise="exercise"
                :showSets="showSets"
                :index="index"
                :weightPbSets="weightPbSets"
                :volumePbSets="volumePbSets"
            />
            <SavingDisplay :workout="workout" />
            <BubbleButton
                @click="workout.addEmptyExercise()"
                fullWidth
            >
                <i class="fa-solid fa-plus"></i> Add Exercise
            </BubbleButton>

        </div>
    </div>
    <LoadingView v-if="loading" />
</template>

<style scoped>
table {
    text-align: center;
}
table td {
    padding: 10px 20px;
}
table p {
    margin: 0;
    padding: 0;
}
table h1 {
    margin: 0;
    padding: 0;
}

.margins {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.strava-sync-btn {
    background: #fc4c02 !important;
    color: white !important;
}

.strava-sync-btn:hover:not(:disabled) {
    background: #e63900 !important;
}

.strava-sync-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.strava-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background: rgba(252, 76, 2, 0.1);
    border: 1px solid #fc4c02;
    border-radius: 8px;
    color: #fc4c02;
    font-weight: 500;
}

.activity-id {
    margin-left: auto;
    font-family: monospace;
    font-size: 0.9em;
}

.sync-message {
    padding: 10px 15px;
    border-radius: 6px;
    font-weight: 500;
    text-align: center;
}

.sync-message.success {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success, #4CAF50);
    border: 1px solid var(--success, #4CAF50);
}

.sync-message.error {
    background: rgba(220, 53, 69, 0.1);
    color: var(--danger, #dc3545);
    border: 1px solid var(--danger, #dc3545);
}

.heart-rate-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.heart-rate-chart-container {
    padding: 15px;
    background: var(--sec);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.hr-stats {
    display: flex;
    /*justify-content: space-around;*/
	justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 15px;
    background: var(--primary-light, rgba(252, 76, 2, 0.05));
    border-radius: 6px;
}

.hr-stat {
    display: block;
    min-width: 70px;
}

.hr-stat .label {
	text-align: center;
	width: 100%;
    font-size: 0.85em;
    color: var(--text-secondary);
    font-weight: 500;
}

.hr-stat .value {
	text-align: center;
	width: 100%;
    font-size: 1em;
    font-weight: bold;
    color: #fc4c02;
}

@media (max-width: 600px) {
    .hr-stats {
        flex-direction: column;
        gap: 8px;
    }
    
    .hr-stat {
        flex-direction: row;
        justify-content: space-between;
        min-width: auto;
    }
}
</style>
