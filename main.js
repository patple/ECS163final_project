import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import StreamGraph from "./apps/streamgraph.js"
import testmakeSlide from "./apps/testmakeslide.js"

let width = window.innerWidth;
let height = window.innerHeight;

let a = new Slide(width, height)
let b = testmakeSlide([0, height/2, width/2, height/2, "magenta"]);
let c = testmakeSlide([width/2, 0, width/2, height/2, "cyan"]);
let d = testmakeSlide([width/2, height/2, width/2, height/2, "yellow"]);

let streamgraph = new StreamGraph(a.base)
console.log(Object.keys({width: 500, height: 500}))
    streamgraph.resizeStream({width: 1200, height: 500})
    streamgraph.defineStreamMargins({top: 50, left: 50, bottom: 50, right: 50})

d3.csv("../data/vgsales.csv").then(data => {
    streamgraph.initDataset(data);
    console.log(streamgraph.dataset)
    streamgraph.calculateRegion("NA");
    streamgraph.drawRegion("NA");
})


let slides = new Slider([a, b, c, d], 200, [-width, 0, width])



d3.select("svg")
    .on("click", function() {slides.goNext(); console.log("a")})
    .on("contextmenu", function() {d3.event.preventDefault(); slides.goPrev(); console.log("b")})