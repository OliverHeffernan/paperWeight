<!-- Page to upload workout images and generate workout data -->
<script setup lang="ts">
// imports
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from './LoadingView.vue';
import UploadComponent from '../components/UploadComponent.vue';
import JSONWorkout from '../interfaces/JSONWorkout';
import Workout from '../classes/Workout';
import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from '../lib/supabase';
import { useRouter } from 'vue-router';

// count the number of loading operations, to decide whether to show loading view.
const loading = ref<integer>(0);
const router = useRouter();

// references to video and canvas elements for the camera display and image capture.
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

// array to store uploaded image URLs and a counter for the number of pages (images).
const urls = ref<string[]>([]);
const pages = ref<integer>(0);

// keep hold of the media stream to stop it when component is unmounted.
const mediaStream = ref<MediaStream | null>(null);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

// start the camera on component mount.
onMounted(async () => {
    const constraints = {
        // portrait orientation
        // use back facing camera
        video: {
			/*
            width: { ideal: 480 },
            height: { ideal: 640 },
			*/
            facingMode: "environment"
        }
    };

    if (video.value) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                mediaStream.value = stream;
                if (video) {
                    video.value.srcObject = stream;
                } else {
                    errorDisplay.value.setError("Error creating video feed", "Video element not found");
                    console.error("Video element not found");
                }
            })
            .catch((err) => {
                errorDisplay.value.setError("Error accessing camera", err.message);
                console.error("Error accessing camera: ", err);
            }
        );
    }
})

// stop the camera when component is unmounted.
onBeforeUnmount(() => {
    if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop());
    }
});

/**
 * Capture an image from the video feed and upload it to Supabase storage.
 * On success, store the image URL for later processing.
 */
const captureAndUpload = async () => {
    if (!video.value || !canvas.value) {
        console.error("Video or canvas element not found");
        errorDisplay.value.setError("Error capturing image", "Video or canvas element not found");
        return;
    }
    const { data: {user}, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("User not authenticated");
        errorDisplay.value.setError("User not authenticated", error?.message || "No user found");
        return;
    }
    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;
    const context = canvas.value.getContext('2d');
    if (!context) {
        errorDisplay.value.setError("Error capturing image", "Failed to get canvas context");
        console.error("Failed to get canvas context");
        return;
    }
    context.drawImage(video.value, 0, 0);

    canvas.value.toBlob(async (blob) => {
        if (!blob) {
            errorDisplay.value.setError("Error capturing image", "Failed to capture image blob");
            console.error("Failed to capture image");
            return;
        }
        const file = new File([blob], `photo-${Date.now()}-${user.id}.jpg`, { type: 'image/jpeg' });
        const {data, error} = await supabase.storage
            .from('workoutImage')
            .upload(`photos/${user.id}/${file.name}`, file, {
                contentType: 'image/jpeg',
                upsert: false
            });
        if (error) {
            errorDisplay.value.setError("Error uploading image", error.message);
            console.error("Error uploading image: ", error);
            return;
        }
        urls.value.push(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/workoutImage/${data.path}`);
        pages.value++;

    }, 'image/jpeg', 0.8);
}

/**
 * Extracts a Date object from the workout data for either start or end time.
 * Fills in missing components with current date/time values.
 */
function extractTime(workoutData: object, start: boolean): Date | null {
    let timeObj: object = start ? workoutData.startTime : workoutData.endTime;
    if (!timeObj) return null;

    const now: Date = new Date();
    if (!timeObj.year) timeObj.year = now.getFullYear();
    if (!timeObj.month) timeObj.month = now.getMonth() + 1;
    if (!timeObj.day) timeObj.day = now.getDate();
    if (!timeObj.hour) timeObj.hour = now.getHours();
    if (!timeObj.minute) timeObj.minute = now.getMinutes();

    return new Date(timeObj.year, timeObj.month - 1, timeObj.day, timeObj.hour, timeObj.minute, 0);
}

/**
 * Creates a workout object formatted for database insertion from the generated workout data.
 * @param workoutData The generated workout data object.
 * @returns An object formatted for database insertion.
 */
async function createWorkoutObject(workoutData: object): JSONWorkout {
    loading.value++;
    // get the start and end time
    const startTime: Date | null = extractTime(workoutData, true);
    const endTime: Date | null = extractTime(workoutData, false);

    // extract exercise names. Store a list of exercise names in the workout object.
    let exercises: Array<string> = [];
    for (const exercise of workoutData.exercises || []) {
        exercises.push(exercise.exercise);
    }

    // convert energy to kcal if in kJ
    let energy: number | null = workoutData.energy ? (workoutData.energy.amount || null) : null;
    if (energy != null && workoutData.energy.unit === "kJ") {
        energy = energy / 4.184;
    }
    if (energy != null) energy = Math.round(energy);

    // get the hearrate data if available
    const heart_rate: number | null = workoutData.heart_rate || null;

    // get the user id
    const user_id = (await supabase.auth.getUser()).data.user?.id;
    // end the load process.
    loading.value--;

    // return the object.
    return {
        user_id: user_id,
        //energy: Math.round(workoutData.calories) || 0,
        start_time: startTime ? startTime.toISOString() : null,
        end_time: endTime ? endTime.toISOString() : null,
        title: workoutData.title || "unnamed workout",
        exercises_full: workoutData.exercises || [],
        exercises: exercises,
        notes: workoutData.notes || "",
        energy: energy,
        heart_rate: heart_rate
    };
}

/**
 * Generate workout data from uploaded images and upload it to the database.
 */
async function generateAndUploadWorkoutData(): void {
    const workoutData = await getWorkoutData(urls.value);
    if (!workoutData) {
        errorDisplay.value.setError("Error generating workout data", "No workout data generated. Please try again by clicking the upload button again.");
        console.error("No workout data generated");
        return;
    }

    const { data, error } = await uploadWorkoutData(workoutData);
    if (error) {
        errorDisplay.value.setError("Error uploading workout data", "Please try again by clicking the upload button again.");
        console.error("Error uploading workout data: ", error);
        return;
    }

    // if successful, navigate to home page.
    router.push({ name: "Home" });
}

async function uploadWorkoutData(workoutData: object): object | null {
    loading.value++;
    const workout = await Workout.create(workoutData);
    loading.value--;
    if (!workout) {
        errorDisplay.value.setError("Error creating workout object", "Please try again by clicking the upload button again.");
        return { data: null, error: "Error creating workout object" };
    }
    const data = workout;
    const error = null;
    return { data: data, error: error };
}

async function getWorkoutData(imgURLs): object {
    loading.value++;
    const { data, error } = await supabase.functions.invoke('generate-workout-data', {
        body: {
            name: "Functions",
            imgURLs: imgURLs
        }
    });
    if (error) {
        console.error("Error invoking function: ", error);

        errorDisplay.value.setError("Error uploading workout data", "Please try again by clicking the upload button again.");

        loading.value--;
        return "";
    }
    loading.value--;
    return data;
}

</script>
<template>
    <LoadingView v-if="loading > 0" />
    <ErrorPopup :error="errorDisplay" />
    <div class="upload-container">
        <div class="camera-section">
            <video
                ref="video"
                class="cameraFeed"
                muted
                playsinline
                webkit-playsinline="true"
                x-website-airplay="deny"
                preload="auto"
                aria-label=""
                autoplay
            />
            <div class="camera-overlay">
                <div class="camera-frame">
                    <div class="corner-frame top-left"></div>
                    <div class="corner-frame top-right"></div>
                    <div class="corner-frame bottom-left"></div>
                    <div class="corner-frame bottom-right"></div>
                </div>
                <div class="camera-instructions">
                    <p class="instruction-text">Position your workout notes within the frame</p>
                    <p class="instruction-subtext">Make sure the text is clear and well-lit</p>
                </div>
            </div>
        </div>
        
        <div class="controls-section">
            <UploadComponent
                :pageCount="pages"
                @uploadWorkoutData="generateAndUploadWorkoutData()"
                @retakePhoto="urls.pop(); pages--"
                class="upload-component"
            />
            
            <button class="captureButton" @click="captureAndUpload()">
                <div class="capture-inner"></div>
            </button>
        </div>
        
        <canvas ref="canvas" class="hidden"></canvas>
    </div>
</template>

<style scoped>
.upload-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--prim);
}

.camera-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.cameraFeed {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: 100%;
    object-fit: cover;
    z-index: 1;
}

.camera-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    padding-bottom: 200px; /* Account for controls section */
    box-sizing: border-box;
}

.camera-frame {
    position: relative;
    width: 80%;
    max-width: 400px;
    aspect-ratio: 3/4;
    border: 2px solid var(--accent);
    border-radius: 15px;
    background: rgba(75, 192, 192, 0.1);
}

.corner-frame {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid var(--accent);
}

.corner-frame.top-left {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 15px;
}

.corner-frame.top-right {
    top: -2px;
    right: -2px;
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 15px;
}

.corner-frame.bottom-left {
    bottom: -2px;
    left: -2px;
    border-right: none;
    border-top: none;
    border-bottom-left-radius: 15px;
}

.corner-frame.bottom-right {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 15px;
}

.camera-instructions {
    margin-top: 30px;
    text-align: center;
    padding: 0 20px;
}

.instruction-text {
    color: var(--text);
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 5px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.instruction-subtext {
    color: var(--text);
    font-size: 1rem;
    opacity: 0.8;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.controls-section {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px; /* Fixed height to prevent overlap */
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    padding-bottom: calc(85px + 20px); /* Navbar height + padding */
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    box-sizing: border-box;
}

.upload-component {
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
}

.captureButton {
    position: relative;
    width: 80px;
    height: 80px;
    background-color: var(--text);
    border: 4px solid var(--accent);
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(75, 192, 192, 0.3);
    flex-shrink: 0;
}

.captureButton:active {
    transform: scale(0.95);
    box-shadow: 0 0 30px rgba(75, 192, 192, 0.6);
}

.capture-inner {
    width: 60px;
    height: 60px;
    background-color: var(--accent);
    border-radius: 50%;
    margin: 6px;
    transition: all 0.2s ease;
}

.captureButton:active .capture-inner {
    background-color: var(--text);
}

.hidden {
    display: none;
}

/* Animation for focusing effect */
@keyframes focusFrame {
    0% {
        box-shadow: 0 0 0 0 rgba(75, 192, 192, 0.8);
    }
    100% {
        box-shadow: 0 0 0 10px rgba(75, 192, 192, 0);
    }
}

.camera-frame {
    animation: focusFrame 2s infinite;
}

@media (max-width: 768px) {
    .camera-overlay {
        padding-bottom: 180px;
    }
    
    .controls-section {
        height: 180px;
        padding-bottom: calc(85px + 15px);
    }
    
    .camera-frame {
        width: 90%;
    }
    
    .instruction-text {
        font-size: 1.1rem;
    }
    
    .instruction-subtext {
        font-size: 0.9rem;
    }
    
    .captureButton {
        width: 70px;
        height: 70px;
    }
    
    .capture-inner {
        width: 50px;
        height: 50px;
        margin: 6px;
    }
}

@media (max-height: 600px) {
    .camera-overlay {
        padding-bottom: 160px;
    }
    
    .controls-section {
        height: 160px;
        padding-bottom: calc(85px + 10px);
    }
    
    .camera-frame {
        width: 70%;
    }
    
    .instruction-text {
        font-size: 1rem;
    }
    
    .instruction-subtext {
        font-size: 0.85rem;
    }
}
</style>
