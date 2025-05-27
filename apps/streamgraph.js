
class StreamGraph {
    parent = null;
    base = null;
    dataset = null;
    windowSize = {width: 0, height: 0};
    streamPos = {x: 0, y: 0};
    streamMargin = {top: 0, right: 0, bottom: 0, left: 0};
    streamSize = {width: 0, height: 0};

    topPubs = null;
    pubColors = d3.schemeCategory10;
    publisherSales = {NA: null, JP: null, EU: null, OTHER: null, GLOBAL: null};
    
    
    constructor(parent) {
        this.parent = parent;
        this.base = parent.append("g");
    }

    /**
     * 
     * @param {*} parent 
     * @returns {Boolean}
     */
    attach(parent) {
        this.parent = parent;
        return true;
    }

    /**
     * 
     * @param {Object} windowSize 
     * @returns {Boolean}
     */
    resizeWindow(windowSize) {
        let ogkeys = this.windowSize.keys();
        windowSize.keys().forEach(key => {
            if (!ogkeys.includes(key)) {
                console.error(`Tried to resize window with bad key: ${key}`);
                return false;
            } else if (isNaN(windowSize[key])) {
                console.error(`Tried to resize window with non-number: ${windowSize[key]}`);
                return false;
            }
            this.windowSize[key] = windowSize[key];
        })
        return true;
    }

    /**
     * 
     * @param {Object} streamSize 
     * @returns {Boolean}
     */
    resizeStream(streamSize) {
        let ogkeys = this.streamSize.keys();
        streamSize.keys().forEach(key => {
            if (!ogkeys.includes(key)) {
                console.error(`Tried to resize stream with bad key: ${key}`);
                return false;
            } else if (isNaN(streamSize[key])) {
                console.error(`Tried to resize stream with non-number: ${streamSize[key]}`);
                return false;
            }
            this.streamSize[key] = streamSize[key];
        })
        return true;
    }
    
    /**
     * 
     * @param {*} streamPos 
     * @returns {Boolean}
     */
    moveStream(streamPos) {
        let ogkeys = this.streamPos.keys();
        streamPos.keys().forEach(key => {
            if (!ogkeys.includes(key)) {
                console.error(`Tried to move stream with bad key: ${key}`);
                return false;
            } else if (isNaN(streamPos[key])) {
                console.error(`Tried to move stream with non-number: ${streamPos[key]}`);
                return false;
            }
            this.streamPos[key] = streamPos[key];
        })
        return true;
    }

    /**
     * 
     * @param {*} streamMargin 
     * @returns {Boolean}
     */
    defineStreamMargins(streamMargin) {
        let ogkeys = this.streamMargin.keys();
        streamMargin.keys().forEach(key => {
            if (!ogkeys.includes(key)) {
                console.error(`Tried to define stream margins with bad key: ${key}`);
                return false;
            } else if (isNaN(streamMargin[key])) {
                console.error(`Tried to define stream margins with non-number: ${streamMargin[key]}`);
                return false;
            }
            this.streamMargin[key] = streamMargin[key];
        })
        return true;
    }



    initDataset(dataset) {
        this.dataset = [...dataset];
    }

    /**
     * 
     * @param {Array} dataset
     * @param {String} region
     */
    calculateRegion(region) {
        this.dataset.forEach(d => {
            d.Year = +d.Year;
            d.NA_Sales = +d.NA_Sales;
        });

        this.dataset = this.dataset.filter(d => !isNaN(d.Year) && !isNaN(d.NA_Sales));

        const publisherNASales = {};
        this.dataset.forEach(d=>{
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

        this.publisherSales[region] = years.map(year => {
            const salesForYear = data.filter(d=> d.Year == year);
            const counts = {};
            topPubs.forEach(pub =>{
                counts[pub] = salesForYear
                    .filter(d=> d.Publisher == pub)
                    .reduce((acc, curr) => acc + curr.NA_Sales, 0);
            })
            return{Year: year, ...counts};
        })
    }

    drawRegion(region) {
        const series = d3.stack()
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)
            .keys(topPubs)
            (this.publisherSales[region])

        const xStream = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([this.streamPos.y + this.streamMargin.left, this.streamPos.x + this.streamSize.width - this.streamMargin.right])
        
        const yStream = d3.scaleLinear()
            .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
            .range([this.streamPos.y + this.streamSize.height + this.streamMargin.bottom, this.streamPos.y + this.streamMargin.top])
        
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
        streamGraph.append("g")
            .attr("transform", `translate(0, ${streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        streamGraph.append("g")
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
    }
}

export default StreamGraph



