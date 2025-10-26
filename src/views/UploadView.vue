<!-- Page to upload workout images and generate workout data -->
<script setup lang="ts">
// imports
import NavBar from '../components/NavBar.vue';
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from './LoadingView.vue';
import UploadComponent from '../components/UploadComponent.vue';
import JSONWorkout from '../interfaces/JSONWorkout';

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

// start the camera on component mount.
onMounted(async () => {
    const constraints = {
        // portrait orientation
        // use back facing camera
        video: {
            width: { ideal: 480 },
            height: { ideal: 640 },
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
                    console.error("Video element not found");
                }
            })
            .catch((err) => {
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
    console.log("capturing");
    if (!video.value || !canvas.value) {
        console.log("Video or canvas element not found");
        return;
    }
    const { data: {user}, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("User not authenticated");
        return;
    }
    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;
    const context = canvas.value.getContext('2d');
    if (!context) {
        console.error("Failed to get canvas context");
        return;
    }
    context.drawImage(video.value, 0, 0);

    canvas.value.toBlob(async (blob) => {
        if (!blob) {
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
            console.error("Error uploading image: ", error);
            return;
        }

        console.log("Image uploaded successfully: ", data);

        console.log(data);

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
        console.error("No workout data generated");
        return;
    }

    const { data, error } = await uploadWorkoutData(workoutData);
    if (error) {
        console.error("Error uploading workout data: ", error);
        return;
    }

    // if successful, navigate to home page.
    router.push({ name: "Home" });
}

async function uploadWorkoutData(workoutData: object): object | null {
    loading.value++;
    const { data, error } = await supabase
        .from('workouts')
        .insert([await createWorkoutObject(workoutData)]);
    if (error) {
        console.error("Error uploading workout data: ", error);
        loading.value--;
        return { data: data, error: error };
    }
    console.log("Workout data uploaded successfully: ", data);
    loading.value--;
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
        console.log(data);
        loading.value--;
        return "";
    }
    loading.value--;
    return data;
}

</script>
<template>
    <LoadingView v-if="loading > 0" />
    <div class="viewArea">
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
        <button class="captureButton" @click="captureAndUpload()"></button>
        <UploadComponent
            :pageCount="pages"
            @uploadWorkoutData="generateAndUploadWorkoutData()"
            @retakePhoto="urls.pop(); pages--"
        />
        <canvas ref="canvas" class="hidden"></canvas>
    </div>
    <NavBar active="/upload" />
</template>

<style scoped>
.cameraFeed {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    object-fit: cover;
}

.captureButton {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 70px;
    background-color: var(--prim);
    border: solid 4px var(--border);
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hidden {
    display: none;
}

#urlsCount {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 16px;
}
</style>
