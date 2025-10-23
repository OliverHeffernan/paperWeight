<script setup lang="ts">
import NavBar from '../components/NavBar.vue';

import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
    const constraints = {
        video: {
            width: { ideal: 480 },
            height: { ideal: 640 },
            facingMode: "environment"
        }
    };

    if (video.value) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
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

        //console.log(await getWorkoutData([`https://gkyqqlkxpfskmtryfmyp.supabase.co/storage/v1/object/public/workoutImage/${data.path}`]));
        const workoutData = await getWorkoutData([`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/workoutImage/${data.path}`]);
        console.log("Generated workout data: ", workoutData);
        //console.log(await getWorkoutData([`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/workoutImage/${data.path}`]));
        await uploadWorkoutData(workoutData);
 

    }, 'image/jpeg', 0.8);
}

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

async function createWorkoutObject(workoutData: object): object {
    console.log("Creating workout object from data: ");
    const startTime = extractTime(workoutData, true);
    const endTime = extractTime(workoutData, false);

    let exercises: Array<string> = [];
    for (const exercise of workoutData.exercises || []) {
        exercises.push(exercise.exercise);
    }

    let energy: number | null = workoutData.energy ? (workoutData.energy.amount || null) : null;
    if (energy != null && workoutData.energy.unit === "kJ") {
        energy = energy / 4.184;
    }
    console.log(workoutData.exercises);

    return {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        energy: workoutData.calories || 0,
        start_time: startTime ? startTime.toISOString() : null,
        end_time: endTime ? endTime.toISOString() : null,
        title: workoutData.title || "unnamed workout",
        exercises_full: workoutData.exercises || [],
        exercises: exercises,
        notes: workoutData.notes || "",
        energy: energy
    };
}

async function uploadWorkoutData(workoutData: object) {
    const { data, error } = await supabase
        .from('workouts')
        .insert([await createWorkoutObject(workoutData)]);
    if (error) {
        console.error("Error uploading workout data: ", error);
        return;
    }
    console.log("Workout data uploaded successfully: ", data);
}

async function getWorkoutData(imgURLs): object {
    const { data, error } = await supabase.functions.invoke('generate-workout-data', {
        body: {
            name: "Functions",
            imgURLs: imgURLs
        }
    });
    if (error) {
        console.error("Error invoking function: ", error);
        console.log(data);
        return "";
    }
    return data;
}

</script>
<template>
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
        <canvas ref="canvas" class="hidden"></canvas>
    </div>
    <NavBar active="/upload" />
</template>

<style scoped>
.cameraFeed {
    width: 100%;
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
</style>
