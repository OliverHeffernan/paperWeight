<template>
    <div class="container">
        <span class="underline"></span>
    </div>
</template>
<style scoped>
.underline {
    display: block;
    height: 0px;
    background-color: var(--btnBorder);
    position: relative;
    overflow: hidden;

    animation-name: underlineMove;
    view-timeline: --box-timeline block;
    animation-timeline: --box-timeline;
    animation-range: 0% 100%;
    animation-duration: 1s;
}

.underline::after {
    width: 100%;
    height: 4px;
    opacity: 1;
}

@keyframes underlineMove {
    0% {
        width: 0%;
        height: 0;
        opacity: 0;
        border-radius: 0;
    }
    80% {
        width: 100%;
        height: 4px;
        opacity: 1;
        border-radius: 2px;
    }
    100% {
        width: 100%;
        height: 4px;
        opacity: 1;
        border-radius: 2px;
    }

}

.container {
    height: 0;
    width: 100%;
}
</style>
