import Slide from "./slides/slideTemplate.js"

export function createStreamMapSlide() {
    const slide = new Slide(window.innerWidth, window.innerHeight);
    drawStreamGraph(slide);
    return slide;
}

export function drawStreamGraph(slide) {
    if (!slide || !slide.base) {
        console.error("Invalid slide object passed to drawStreamGraph");
        return;
    }

    const width = slide.width;
    const height = slide.height;

    let streamLeft = 0, streamTop = 600;
    let streamMargin = {top: 500, right: 0, bottom: 200, left: -130},
        streamWidth = width - 450 - streamMargin.left - streamMargin.right,
        streamHeight = height - streamMargin.top - streamMargin.bottom;

    const svg = slide.base;

    const streamGraph = svg.append("g") 
                    .attr("width", streamWidth + streamMargin.left + streamMargin.right)
                    .attr("height", streamHeight + streamMargin.top + streamMargin.bottom)
                    .attr("transform", `translate(${streamMargin.left+300}, ${streamTop-20})`);

    d3.csv("./data/vgsales.csv").then(data => {
        // Clean and parse data
        data = data.filter(d => d.Year && d.NA_Sales && d.Publisher)
                  .map(d => {
                      return {
                          Year: +d.Year,
                          NA_Sales: +d.NA_Sales,
                          Publisher: d.Publisher
                      };
                  })
                  .filter(d => !isNaN(d.Year) && !isNaN(d.NA_Sales));

        const publisherNASales = {};
        data.forEach(d => {
            if (!publisherNASales[d.Publisher]) {
                publisherNASales[d.Publisher] = 0;
            }
            publisherNASales[d.Publisher] += d.NA_Sales;
        });

        const topPubs = Object.entries(publisherNASales)
            .sort((a,b) => b[1] - a[1])
            .slice(0,10)
            .map(d => d[0]);

        const years = Array.from(new Set(data.map(d => d.Year)))
                         .sort((a, b) => a - b)
                         .filter(year => !isNaN(year));

        const salesPerYear = years.map(year => {
            const salesForYear = data.filter(d => d.Year === year);
            const counts = {};
            topPubs.forEach(pub => {
                counts[pub] = salesForYear
                    .filter(d => d.Publisher === pub)
                    .reduce((acc, curr) => acc + curr.NA_Sales, 0);
            });
            return {Year: year, ...counts};
        });

        // Verify we have valid data before proceeding
        if (salesPerYear.length === 0 || topPubs.length === 0) {
            console.error("No valid data to display");
            return;
        }

        const series = d3.stack()
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)
            .keys(topPubs)
            (salesPerYear);

        const xStream = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([0, streamWidth]);
        
        const yStream = d3.scaleLinear()
            .domain([
                d3.min(series, d => d3.min(d, d => d[0])) || 0,
                d3.max(series, d => d3.max(d, d => d[1])) || 1
            ])
            .range([streamHeight, 0]);
        
        const area = d3.area()
            .x(d => xStream(d.data.Year))
            .y0(d => yStream(d[0]))
            .y1(d => yStream(d[1]))
            .curve(d3.curveBasis);
        
        const publishersColors = d3.scaleOrdinal()
            .domain(topPubs)
            .range(d3.schemeCategory10);

        streamGraph.selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", d => publishersColors(d.key))
            .attr("class", "stream-colors")
            .attr("d", area)
            .append("title")
            .text(d => `${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M`);

        // X-axis in years
        streamGraph.append("g")
            .attr("transform", `translate(0, ${streamHeight})`)
            .call(d3.axisBottom(xStream).ticks(years.length).tickFormat(d3.format("d")));
        
        // Y-axis in sales in millions
        streamGraph.append("g")
            .call(d3.axisLeft(yStream).ticks(5));
        
        // Y-axis label
        streamGraph.append("text")
            .attr("x", 0 - (streamHeight / 2))
            .attr("y", streamMargin.left + 60 )
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("SALES (MILLIONS)");
            
        // X-axis label
        streamGraph.append("text")
            .attr("x", streamWidth / 2)
            .attr("y", streamHeight + 40)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .text("YEAR");
        
        // Graph title
        streamGraph.append("text")
            .attr("x", streamWidth / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text("Publisher Sales in North America Over Years");
        
        // Legend for streamgraph
        const key = streamGraph.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${streamWidth - 70}, 0)`);
        
        const keySpacing = 20;
        topPubs.forEach((pub, i) => {
            key.append("rect")
                .attr("x", 0)
                .attr("y", i * keySpacing)
                .attr("width", 16)
                .attr("height", 16)
                .attr("fill", publishersColors(pub))
                .style("cursor", "pointer");
            
            key.append("text")
                .attr("x", 20)
                .attr("y", i * keySpacing + 12)
                .style("font-size", "12px")
                .text(pub);
        });
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
}