<template>
	<div class="splash-view">
		<div class="gradient"></div>
		<div class="logo">
			<span class="part left">
				<span class="text">Paper</span>
			</span>
			<span class="w">W</span>
			<span class="part right">
				<span class="text">eight</span>
			</span>
		</div>
	</div>
</template>
<style scoped>
@keyframes gradient {
	0% {
		opacity: 0;
		left: -50%;
		scale: 1;
	}
	50% {
		opacity: 1;
		left: 0;
		scale: 1.2;
	}
	100% {
		opacity: 0;
		left: 50%;
		scale: 0;
	}
}
.gradient {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle at center, var(--accent), transparent 2.5%, transparent 20%);
	animation: gradient 1.6s ease-in-out forwards;
	animation-fill-mode: forwards;
	animation-delay: 0.2s;
	opacity: 0;
}

.splash-view {
	z-index: 1000;
	position: fixed;
	inset: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--prim);
	color: var(--text);
	font-size: 4em;
	text-align: center;
}

.logo {
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	white-space: nowrap;
}

.w {
	flex-shrink: 0;
	font-style: italic; /* if you want the W italic like in original */
}

.part {
	overflow: hidden;
	flex-shrink: 0;
}

.part .text {
	display: inline-block;
	white-space: nowrap;
}

.left .text {
	width: 41px;
	animation: expandLeft 0.8s ease-in-out forwards;
	animation-delay: 1s;
	font-weight: bold;
}

.right .text {
	width: 0;
	animation: expandRight 0.8s ease-in-out forwards;
	animation-delay: 1s;
}

@keyframes expandLeft {
to { width: 178px; } /* exact final width of "Paper" */
}

@keyframes expandRight {
to { width: 150px; } /* exact final width of "eight" */
}
</style>
