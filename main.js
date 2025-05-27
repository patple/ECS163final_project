import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import testmakeSlide from "./apps/testmakeslide.js"
import createStreamGraph from "./apps/streamMap1.js"

let width = window.innerWidth;
let height = window.innerHeight;

let a = testmakeSlide([0, 0, width, height, "black"]);
let b = testmakeSlide([0, 0, width, height, "magenta"]);
let c = testmakeSlide([0, 0, width, height, "cyan"]);
let d = testmakeSlide([0, 0, width, height, "yellow"]);

let e = new Slide(20000, 20102010210);
createStreamGraph(e.base);

let slides = new Slider([a, b, c, d, e], 200, [-width, 0, width])


d3.select("svg")
    .on("click", function() {slides.goNext(); console.log("a")})
    .on("contextmenu", function() {d3.event.preventDefault(); slides.goPrev(); console.log("b")})