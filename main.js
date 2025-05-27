import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import testmakeSlide from "./apps/testmakeslide.js"
import { createStreamMapSlide } from "./apps/streamMap1.js";

let width = window.innerWidth;
let height = window.innerHeight;

let streamMapSlide = createStreamMapSlide();
let a = testmakeSlide([0, 0, width/2, height/2, "black"]);
let b = testmakeSlide([0, height/2, width/2, height/2, "magenta"]);
let c = testmakeSlide([width/2, 0, width/2, height/2, "cyan"]);
let d = testmakeSlide([width/2, height/2, width/2, height/2, "yellow"]);

let slides = new Slider([streamMapSlide, a, b, c, d], 200, [-width, 0, width]);

// Controls the display of all overlays
function updateOverlays(currentIndex) {
    document.querySelectorAll('.slide-overlay').forEach(overlay => {
        overlay.style.display = parseInt(overlay.dataset.slideIndex) === currentIndex 
            ? 'block' 
            : 'none';
    });
}

// ADD Slide switch
slides.onSlideChange = (currentIndex) => {
    updateOverlays(currentIndex);
};

// int display
updateOverlays(slides.currentIndex);

d3.select("svg")
    .on("click", function() { slides.goNext(); })
    .on("contextmenu", function() { 
        d3.event.preventDefault(); 
        slides.goPrev(); 
    });

// each butt action
document.getElementById('zoom-in')?.addEventListener('click', function() {
    console.log('Zoom in clicked on stream graph');
});