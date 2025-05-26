const width = window.innerWidth;
const height = window.innerHeight;


let streamLeft = 0, streamTop = 400;
let streamMargin = {top: 10, right: 30, bottom: 0, left: 60},
    streamWidth = width - 450-streamMargin.left - streamMargin.right,
    streamHeight = height- 1250 - streamMargin.top - streamMargin.bottom;


const svg = d3.select("svg")

const streamGraph = svg.append("g") 
                .attr("width", streamWidth + streamMargin.left + streamMargin.right)
                .attr("height", streamHeight + streamMargin.top + streamMargin.bottom)
                .attr("transform", `translate(${streamMargin.left+300}, ${streamTop-20})`);

let currentPublisher = null;


d3.csv("vgsales.csv").then(data=>{
    data.forEach(d=>{
        d.Year = +d.Year;
        d.NA_Sales = +d.NA_Sales;
    });

    data = data.filter(d=> !isNaN(d.Year) && !isNaN(d.NA_Sales));

    const publisherNASales ={};
    data.forEach(d=>{
        if (!publisherNASales[d.Publisher]){
            publisherNASales[d.Publisher] = 0;
        }
        publisherNASales[d.Publisher] += d.NA_Sales
    })
    const topPubs = Object.entries(publisherNASales)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10)
        .map(d=>d[0])

        const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => a - b);

        const salesPerYear = years.map(year => {
            const salesForYear = data.filter(d=> d.Year == year);
            const counts = {};
            topPubs.forEach(pub =>{
                counts[pub] = salesForYear
                    .filter(d=> d.Publisher == pub)
                    .reduce((acc, curr) => acc + curr.NA_Sales, 0);
        })
        return{Year: year, ...counts};
    })

    const series = d3.stack()
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut)
        .keys(topPubs)
        (salesPerYear)

    const xStream = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, streamWidth])
    
    const yStream = d3.scaleLinear()
        .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
        .range([streamHeight, 0])
    
    const area = d3.area()
        .x(d => xStream(+d.data.Year))
        .y0(d => yStream(d[0]))
        .y1(d => yStream(d[1]))
        .curve(d3.curveBasis)
    
    const publishersColors = d3.scaleOrdinal()
        .domain(topPubs)
        .range(d3.schemeCategory10)

     streamGraph.selectAll("path")
        .data(series)
        .join("path")
        .attr("fill", d => publishersColors(d.key))
        .attr("class", "stream-colors")
        .attr("d", area)
        .append("title")
        .text(d =>`${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M` )

    //Xaxis in years
    streamGraph.append("g" )
        .attr("transform", `translate(0, ${streamMargin.bottom})`)
        .call(d3.axisBottom(xStream).ticks(years.length).tickFormat(d3.format("d")))
    
    //Yaxis in sales in millions
    streamGraph.append("g" )
        .call(d3.axisLeft(yStream).ticks(5))
    

    //Yaxis label
    streamGraph.append("text")
        .attr("x", 150)
        .attr("y", streamMargin.left -100)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("SALES (MILLIONS)")
        
    //Xaxis label
    streamGraph.append("text")
        .attr("x", streamMargin.bottom + 700)
        .attr("y",streamMargin.bottom + 50)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .text("YEAR")
    
     // graph label
    streamGraph.append("text")
        .attr("x", 400 )
        .attr("y", -320)
        .attr("text-anchor", "middle")
        .attr("font-weight","bold")
        .text("Publisher Sales in North America Over Years")
    
    //key for streamgraph
    const key = streamGraph.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${streamHeight+ 50}, 50 )`)
    
    const keySpacing = 20;
    key.selectAll(".key-item")
        .data(topPubs)
        .enter()
        .append("g")
        .attr("class", "key-item")
        .attr("transform", (d,i) => `translate(0, ${i*keySpacing})`)
        .each(function(d){
            const g = d3.select(this)
            g.select(this)
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 16)
                .attr("height", 16)
                .attr("fill", publishersColors(d))
                .style("cursor", "pointer")
            g.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .style("font-size", "12px")
                .text(d)
                
        })

    
    

})



