<!-- Page to upload workout images and generate workout data -->
<script setup lang="ts">
// imports
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from './LoadingView.vue';
import UploadComponent from '../components/UploadComponent.vue';
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

// array to store captured image base64 data and a counter for the number of pages (images).
const imageData = ref<string[]>([]);
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
 * Capture an image from the video feed and convert to base64.
 * On success, store the base64 data for later processing.
 */
const captureAndUpload = async () => {
	const startTime = performance.now();
	
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

	try {
		// Convert canvas to base64
		const base64Data = canvas.value.toDataURL('image/jpeg', 0.65);
		imageData.value.push(base64Data);
		pages.value++;
		const endTime = performance.now();
		console.log(`Image captured and converted to base64 in ${endTime - startTime} ms`);
	} catch (error) {
		errorDisplay.value.setError("Error capturing image", "Failed to convert image to base64");
		console.error("Failed to convert image to base64: ", error);
	}
}

/**
 * Generate workout data from captured images and upload it to the database.
 */
async function generateAndUploadWorkoutData(): void {
	const startTime = performance.now();
	const workoutId = await getWorkoutData(imageData.value);
	const endTime = performance.now();
	console.log(`Workout data generated in ${endTime - startTime} ms`);
	console.log(workoutId);

	if (!workoutId) {
		errorDisplay.value.setError("Error generating workout data", "No workout data generated. Please try again by clicking the upload button again.");
		console.error("No workout data generated");
		return;
	}
	console.log(workoutId);

	// if successful, navigate to home page.
	//router.push({ name: "Home" });
	router.push({ name: "View Workout", params: { workout_id: workoutId.workout_id } });
}

async function getWorkoutData(imageData): object {
	loading.value++;
	const { data: { session }} = await supabase.auth.getSession();
	if (!session) {
		throw new Error("User not authenticated");
	}
	const accessToken = session.access_token;
	const { data, error } = await supabase.functions.invoke('generate-workout-data', {
		body: {
			name: "Functions",
			imageData: imageData
		},
		headers: {
			'Authorization': `Bearer ${accessToken}`,
		}
	});
	if (error) {
		console.error("Error invoking function: ", error);

		errorDisplay.value.setError("Error uploading workout data", "Please try again by clicking the upload button again.");

		loading.value--;
		return "";
	}
	loading.value--;
	console.log(data);
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
		</div>

		<div class="controls-section">
			<UploadComponent
				:pageCount="pages"
				@uploadWorkoutData="generateAndUploadWorkoutData()"
				@retakePhoto="imageData.pop(); pages--"
				class="upload-component"
			/>

			<button class="captureButton" @click="captureAndUpload()">
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
