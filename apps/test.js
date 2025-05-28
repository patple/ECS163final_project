



function testmake(dataset) {
    let a = d3.select("svg").append("g")

    a.append("rect")
        .attr("x", dataset[0])
        .attr("y", dataset[1])
        .attr("width", dataset[2])
        .attr("height", dataset[3])
    console.log(a)
    return a
}

export default testmake;