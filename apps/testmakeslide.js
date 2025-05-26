import Slide from "./slides/slideTemplate.js"

function testmakeSlide(dataset) {
    let a = new Slide(20000, 20102010210)

    a.base.append("rect")
        .attr("x", dataset[0])
        .attr("y", dataset[1])
        .attr("width", dataset[2])
        .attr("height", dataset[3])
        .attr("fill", dataset[4]);
    return a
}

export default testmakeSlide