import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"

let width = window.innerWidth;
let height = window.innerHeight;

let a = testmake([0, 0, width/2, height/2])
let b = testmake([0, height/2, width/2, height/2]).attr("fill", "crimson")
let c = testmake([width/2, 0, width/2, height/2]).attr("fill", "steelblue")
let d = testmake([width/2, height/2, width/2, height/2]).attr("fill", "gold")

console.log(c.node().nodeName)

let slides = new Slider([a, b, c, d,], 200, [-width, 0, width])

d3.select("svg")
    .on("click", function() {slides.goNext(); console.log("a")})
    .on("contextmenu", function() {d3.event.preventDefault(); slides.goPrev(); console.log("b")})