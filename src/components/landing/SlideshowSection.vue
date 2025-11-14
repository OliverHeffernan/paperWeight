<script setup lang="ts">
import { ref, onMounted } from "vue";
import Slide1 from "../../assets/slideshow_images/slide_1.png";
import Slide2 from "../../assets/slideshow_images/slide_2.png";
import Slide3 from "../../assets/slideshow_images/slide_3.png";
import Slide4 from "../../assets/slideshow_images/slide_4.png";
import Slide5 from "../../assets/slideshow_images/slide_5.png";
import Slide6 from "../../assets/slideshow_images/slide_6.png";
import Slide7 from "../../assets/slideshow_images/slide_7.png";

const slides = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7];
const altTexts = [
    "Screenshot of the Home page, which displays logged workouts along with some key stats.",
    "Screenshot of the workout view page, showing mainly the overview of the workout, which displays some key stats.",
    "Screenshot of the workout view page, showing how exercises are displayed on the page, as well as personal records.",
    "Screenshot of the Stats page, showing graph size options, and some key stats.",
    "Screenshot of the Stats page, showing the graph.",
    "Screenshot of the Exercises page, showing a list of exercises, along with their personal records.",
    "Screenshot of the Exercise view page, displaying a graph of set volume by the date that it was completed. And a list of workouts where the exercise was done."
];

function nextSection() {
    const phone = document.querySelector(".phone") as HTMLElement;
    if (phone) {
        const slideContainer = document.querySelector(".slideContainer") as HTMLElement;
        const slideWidth = slideContainer ? slideContainer.clientWidth : phone.clientWidth;
        phone.scrollBy({ left: slideWidth, behavior: "smooth" });
    }
}

function prevSection() {
    const phone = document.querySelector(".phone");
    if (phone) {
        const slideContainer = document.querySelector(".slideContainer") as HTMLElement;
        const slideWidth = slideContainer ? slideContainer.clientWidth : phone.clientWidth;
        phone.scrollBy({ left: -slideWidth, behavior: "smooth" });
    }
}

onMounted(() => {
    const firstSlide = document.querySelectorAll(".phoneSlide")[0];
    if (firstSlide) {
        firstSlide.scrollIntoView({ behavior: "instant", block: "start" });
        window.scrollTo(0, 0);
    }

});
</script>
<template>
    <div class="container">
        <div class="phone">
            <div
                v-for="(slide, index) in slides"
                :key="index"
                class="slideContainer"
            >
                <button
                    class="iconButton rightBtn slideSwitcher"
                    v-if="index < slides.length - 1"
                    @click="nextSection()"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button
                    class="iconButton leftBtn slideSwitcher"
                    v-if="index > 0"
                    @click="prevSection()"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>

                <img :src="slide" class="phoneSlide" :alt="altTexts[index]" />
            </div>
        </div>
    </div>
</template>
<style scoped>
.container {
    position: relative;
    background-color: var(--prim);
    border-top: 1px solid var(--border);
    z-index: 10;
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 40px 0;
}

.phone {
    width: 310px;
    overflow: auto;
    display: flex;
    flex-direction: row;
    gap: 0;
    flex-wrap: nowrap;
    border-radius: 30px;
    scroll-snap-type: x mandatory;
    position: relative;
}

.phoneSlide {
    width: 250px;
    height: auto;
    border-radius: 20px;
    border: 5px solid var(--border);
}

.slideContainer {
    scroll-snap-align: center;
    position: relative;
    padding: 0 30px;
}

.leftBtn {
    position: absolute;
    left: 0px;
}

.rightBtn {
    position: absolute;
    right: 0px;
}

.slideSwitcher {
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
    font-size: 22px;
}
</style>
