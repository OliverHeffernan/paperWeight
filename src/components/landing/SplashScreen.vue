<template>
    <div class="splash">
        <div class="margins">
            <h1>Your Paper Logs,<br><span style="color: var(--accent)">Digitized Instantly</span></h1>
            <p>Snap a photo of your workout notebook and let AI transform it into detailed digital logs. Track your progress, analyze your stats, and crush your personal bests.</p>
        </div>
    </div>
    <div class="gradient"></div>
    <div class="splash-spacer"></div>
</template>
<style scoped>
.splash {
    text-align: center;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 2;
    justify-content: center;
}


.splash .margins {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.margins h1 {
    font-size: 50px;
}
.splash-spacer {
    height: 90vh;
    width: 100%;
}
.gradient {
    position: fixed;
    top: 0;
    height: 200vh;
    width: 100%;
    z-index: 1;
    background: radial-gradient(circle at center, var(--accent) 0%, var(--prim) 50%);
}
</style>
