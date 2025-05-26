import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import testmakeSlide from "./apps/testmakeslide.js"

let width = window.innerWidth;
let height = window.innerHeight;

let a = testmakeSlide([0, 0, width/2, height/2, "black"]);
let b = testmakeSlide([0, height/2, width/2, height/2, "magenta"]);
let c = testmakeSlide([width/2, 0, width/2, height/2, "cyan"]);
let d = testmakeSlide([width/2, height/2, width/2, height/2, "yellow"]);

let slides = new Slider([a, b, c, d], 200, [-width, 0, width])

d3.select("svg")
    .on("click", function() {slides.goNext(); console.log("a")})
    .on("contextmenu", function() {d3.event.preventDefault(); slides.goPrev(); console.log("b")})