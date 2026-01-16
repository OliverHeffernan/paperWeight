<template>
	<a class="helpLink" href="https://paperweight-support.olihef.com" target="_blank" rel="noopener"><i class="fa-solid fa-question"></i></a>
</template>
<style scoped>
.helpLink {
	position: fixed;
	bottom: 100px;
	right: 10px;
	font-size: 24px;
	color: var(--border);
	background-color: var(--sec);
	padding: 10px;
	border-radius: 50%;
	border: 1px solid var(--border);
}

.helpLink i {
	color: inherit;
	transition: color 0.2s;
}

.helpLink:hover i {
	color: var(--text);
}
</style>
