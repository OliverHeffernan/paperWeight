<template>
    <TopBar v-if="route.name !== 'landing'" />
    <div v-if="route.name !== 'landing'" class="spacer" style="height: 70px;"></div>
    <RouterView />
    <NavBar
        v-if="!canGoBack() && route.name !== 'landing'"
        :active="route.name || ''"
    />
</template>

<script setup lang="ts">

function canGoBack(): boolean {
    if (route.name === "Home" || route.name === "Stats" || route.name === "Exercises" || route.name === "Upload") {
        return false;
    }
    return window.history.length > 1;
}

import NavBar from './components/NavBar.vue';
import BubbleButton from './components/BubbleButton.vue';
import TopBar from './components/TopBar.vue';
import OptionPopup from './components/OptionPopup.vue';
import { supabase } from './lib/supabase';
import { useRouter, useRoute, RouterView } from 'vue-router';
import { ref } from 'vue';
const active = ref<string>("/home");

const router = useRouter();
const route = useRoute();

async function checkUser() {
    if (route.name === "SignIn" || route.name === "SignUp" || "landing") {
        return;
    }
	const thing = await supabase.auth.getUser();
	if (thing.data.user) {
		return;
	}

    router.push({ name: "Sign In" });
}

checkUser();
</script>

<style>
:root {
	--prim: #0B1119;
	--sec: #13202E;
    /*--sec: #2c3e50;*/
	--text: #FFFFFF;
	--border: #656668;
	--btnBG: #13202E;
	--btnBorder: #6180BF;
	--errorBorder: #FF4C71;
    --goodBorder: #00ED9E;
    --errorBG: #3C1C2A;
    --gold: #FFD700;
    --accent: rgb(75, 192, 192);
    --accentTransparent: rgba(75, 192, 192, 0.2);
}

p {
    font-size: 16px;
}


#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	/*text-align: center;*/
	color: var(--text);
	background-color: var(--prim);
	margin-top: 60px;
	margin: 0;
	padding: 0;
    font-size: 16px;
}

body {
	margin: 0;
	padding: 0;
}

* {
	color: var(--text);
}

body, textarea, .side, button, input {
	background-color: var(--prim);
}

input {
	padding: 5px;
	margin: 0;
	font-size: 16px;
	border: var(--border) 1px solid;
	border-radius: 5px 5px 0 0;
}

input:hover {
	border-bottom-color: color-mix(in srgb, var(--text) 50%, transparent);
	border-bottom-width: 2px;
}

input:focus {
	border-bottom-color: var(--text);
	border-bottom-width: 2px;
	outline: none;
}

textarea {
	resize: none;
	height: auto;
	font-size: 16px;
    border: var(--border) 1px solid;
    border-radius: 5px 5px 0 0;
    padding: 5px;
}

textarea:focus {
    outline: none;
}

.iconButton {
	position: relative;
	font-size: 16px;
	border: none;
	background: none;
}

.margins {
	width: min(100vw - 40px, 800px);
	margin: 0 auto;
    padding-bottom: 20px;
}

.marginsWidth {
    width: min(100vw - 40px, 800px);
    box-sizing: border-box;
}
.marginsWidth * {
    box-sizing: border-box;
}

#cardEditCont {
	width: calc(100% - 30px);
}

.tableContent {
	width: calc(50% - 10px);
}

.tableContent textarea {
	width: calc(100% - 30px);
	margin-left: 10px;

	border: 1px solid var(--border);
	border-radius: 10px;
	padding: 10px;
}

.label {
	width: 10px;
}

.fullWidth {
	margin-left: 8px;
	width: calc(100% - 48px);
}

.tooltip {
	position: absolute;
	right: 100%;
	font-size: 16px;
	white-space: nowrap;
	background-color: rgb(30,30,30);
	color: white;
	padding: 5px;
	pointer-events: none;
	border-radius: 8px 0 8px 8px;
	transition: opacity 0.1s linear 0.4s;
	transition-delay: 0s;
	opacity: 0;
	min-width: 200px;
	max-width: 1000px;
	text-wrap: wrap;
	text-align: left;

	box-shadow: 0 0 5px 0 rgba(255,255,255,0.5);
}

.right {
	left: 100%;
}

.left {
	right: 100%;
}

.down {
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
}

.iconButton:hover .tooltip, button:hover .tooltip, .bubbleButton:hover .tooltip {
	opacity: 1;
	transition-delay: 0.8s;
}

.popupCont {
	transition: opacity 0.2s;
	display: flex;
	z-index: 5;
}

.popup {
	background-color: var(--prim);
	border: solid 1px var(--border);
	padding: 20px;
	padding-top: 40px;
	border-radius: 20px;
	width: auto;

	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	font-size: 16px;
}

.popup .iconButton {
	position: absolute;
	top: 5px;
	right: 5px;
}

.updown {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: auto 0;
}

.updown button {
	margin: -5px;
}

.viewArea {
    padding-bottom: 100px;
}

.softBubble {
    padding: 15px;
    border: solid 1px var(--border);
    /*background-color: color-mix(in srgb, var(--border) 20%, transparent);*/
    box-shadow: 0 0 10px 0 rgba(255,255,255,0.1);
    background-color: var(--sec);
    font-size: 16px;
    border-radius: 10px;
    margin-left: 0;
    margin-right: 0;
}

.greyed {
    opacity: 0.7;
}

.borderlessButton {
    background: none;
    border: none;
    font-size: 16px;
    padding: 0;
    cursor: pointer;
}

.clickable {
    cursor: pointer;
}

.link {
    text-decoration: none;
}

.signOutButton {
    position: fixed;
    top: 17px;
    right: 20px;
    font-size: 15px;
}

</style>
