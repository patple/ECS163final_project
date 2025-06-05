
class StreamGraph {
    parent = null;
    base = null;
    dataset = null;
    windowSize = {width: 0, height: 0};
    streamPos = {x: 0, y: 0};
    streamMargin = {top: 0, right: 0, bottom: 0, left: 0};
    streamSize = {width: 0, height: 0};

    
    pubColors = d3.schemeCategory10;
    topPubs = {NA: null, JP: null, EU: null, Other: null, Global: null};
    publisherSales = {NA: null, JP: null, EU: null, Other: null, Global: null};
    publisherStreamData = {NA: null, JP: null, EU: null, Other: null, Global: null};
    years = null;

    genreSales ={ NA: null, JP : null, EU: null, Other: null, Global: null};
    genreStreamData = {NA: null, JP: null, EU: null, Other: null, Global: null};
    
    // Add transition properties
    transitionDuration = 875;
    currentView = null; // 'publisher' or 'genre'
    currentRegion = null;
    
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
        let ogkeys = Object.keys(this.windowSize);
        Object.keys(this.windowSize).forEach(key => {
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
        let ogkeys = Object.keys(this.streamSize);
        Object.keys(this.streamSize).forEach(key => {
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
        let ogkeys = Object.keys(this.streamPos);
        Object.keys(this.streamPos).forEach(key => {
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
        let ogkeys = Object.keys(this.streamMargin);
        Object.keys(this.streamMargin).forEach(key => {
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

    /**
     * Set transition duration for animations
     * @param {number} duration - Duration in milliseconds
     */
    setTransitionDuration(duration) {
        this.transitionDuration = duration;
    }

    initDataset(dataset) {
        this.dataset = [...dataset];
        let yrextent = d3.extent(dataset.map(d => d.Year).filter(d => !isNaN(d)));
        yrextent[1]++;
        this.years = d3.range(...yrextent, 1);
    }

    /**
     * 
     * @param {Array} dataset
     * @param {String} region
     */
    calculateRegion(region) {
        let regionalSales = region.concat("_Sales");
        let data = [...this.dataset];

        // Clean and parse data
        data = data.filter(d => d.Year && d[regionalSales] && d.Publisher)
                  .map(d => {
                        let entry = {
                            Year: +d.Year,
                            Publisher: d.Publisher
                        }
                        entry[regionalSales] = +d[regionalSales]
                      return entry;
                  })
                  .filter(d => !isNaN(d.Year) && !isNaN(d[regionalSales]));

        this.publisherSales[region] = {};
        data.forEach(d=>{
            if (!this.publisherSales[region][d.Publisher]){
                this.publisherSales[region][d.Publisher] = 0;
            }
            this.publisherSales[region][d.Publisher] += d[regionalSales]
        })

        this.topPubs[region] = Object.entries(this.publisherSales[region])
            .sort((a,b) => b[1] - a[1])
            .slice(0,10)
            .map(d => d[0])

        this.publisherStreamData[region] = this.years.map(year => {
            let salesForYear = data.filter(d => d.Year == Number(year));
            let counts = {};
            this.topPubs[region].forEach(pub =>{
                counts[pub] = salesForYear
                    .filter(d=> d.Publisher == pub)
                    .reduce((acc, curr) => acc + curr[regionalSales], 0);
            })
            return{Year: Number(year), ...counts};
        })
    }

    calculateGenre(region){
        let regionalSales = region.concat("_Sales");
        let data = [...this.dataset];

        // Clean and parse data
        data = data.filter(d => d.Year && d[regionalSales] && d.Publisher)
                  .map(d => {
                        let entry = {
                            Year: +d.Year,
                            Genre: d.Genre,
                        }
                        entry[regionalSales] = +d[regionalSales]
                      return entry;
                  })
                  .filter(d => !isNaN(d.Year) && !isNaN(d[regionalSales]));
        
        
        this.genreSales[region] = {};
        data.forEach(d=>{
            if (!this.genreSales[region][d.Genre]){
                this.genreSales[region][d.Genre] = 0;
            }
            this.genreSales[region][d.Genre] += d[regionalSales]
        })

        this.topGenres = this.topGenres || {}
        this.topGenres[region] = Object.entries(this.genreSales[region])
            .sort((a,b) => b[1] - a[1])
            .map(d => d[0])
        
        
        this.genreStreamData[region] = this.years.map(year => {
            let salesForYear = data.filter(d => d.Year == Number(year));
            let counts = {};
            this.topGenres[region].forEach(genre =>{
                counts[genre] = salesForYear
                    .filter(d=> d.Genre == genre)
                    .reduce((acc, curr) => acc + curr[regionalSales], 0);
            })
            return{Year: Number(year), ...counts};
        })
    }

    /**
     * Smooth transition between different data views
     * @param {string} region - Region code (NA, JP, EU, Other, Global)
     * @param {string} viewType - 'publisher' or 'genre'
     */
    transitionTo(region, viewType = 'publisher') {
        // Calculate new data if needed
        if (viewType === 'publisher') {
            this.calculateRegion(region);
        } else {
            this.calculateGenre(region);
        }

        // Check if this is the first render or same view
        const isFirstRender = !this.currentView && !this.currentRegion;
        const isSameView = this.currentView === viewType && this.currentRegion === region;
        
        if (isSameView) {
            // No transition needed, draw directly
            if (viewType === 'publisher') {
                this.drawRegion(region);
            } else {
                this.drawGenre(region);
            }
            this.currentView = viewType;
            this.currentRegion = region;
            return;
        }

        this.currentView = viewType;
        this.currentRegion = region;

        // Perform transition
        this.performTransition(region, viewType);
    }

    /**
     * Execute the actual transition animation
     * @param {string} region - Target region
     * @param {string} viewType - Target view type
     */
    performTransition(region, viewType) {
        const t = d3.transition().duration(this.transitionDuration);
        
        // Get new data and scales
        const newData = viewType === 'publisher' ? 
            this.publisherStreamData[region] : 
            this.genreStreamData[region];
        
        const newKeys = viewType === 'publisher' ? 
            this.topPubs[region] : 
            this.topGenres[region];

        if (!newData || newData.length === 0 || !newKeys || newKeys.length === 0) {
            console.error("No valid data for transition");
            return;
        }

        const newSeries = d3.stack()
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)
            .keys(newKeys)
            (newData);

        const xStream = d3.scaleLinear()
            .domain(d3.extent(this.years))
            .range([this.streamPos.x + this.streamMargin.left, this.streamPos.x + this.streamSize.width - this.streamMargin.right]);
        
        const yStream = d3.scaleLinear()
            .domain([d3.min(newSeries, d => d3.min(d, d => d[0])), d3.max(newSeries, d => d3.max(d, d => d[1]))])
            .range([this.streamPos.y + this.streamSize.height - this.streamMargin.bottom, this.streamPos.y + this.streamMargin.top]);
        
        const area = d3.area()
            .x(d => xStream(d.data.Year))
            .y0(d => yStream(d[0]))
            .y1(d => yStream(d[1]))
            .curve(d3.curveBasis);

        const newColors = d3.scaleOrdinal()
            .domain(newKeys)
            .range(viewType === 'publisher' ? d3.schemeCategory10 : d3.schemePaired);

        // Phase 1: Fade out current elements
        this.base.selectAll("path.stream-colors")
            .transition(t)
            .style("opacity", 0)
            .on("end", () => {
                // Phase 2: Update data and fade in new elements
                const paths = this.base.selectAll("path.stream-colors")
                    .data(newSeries, d => d.key);

                // Remove old paths
                paths.exit().remove();

                // Add new paths
                const newPaths = paths.enter()
                    .append("path")
                    .attr("class", "stream-colors")
                    .style("opacity", 0);

                // Update all paths
                paths.merge(newPaths)
                    .attr("fill", d => newColors(d.key))
                    .attr("d", area)
                    .select("title")
                    .text(d => {
                        if (viewType === 'publisher') {
                            const values = d.reduce((acc, p) => acc + (p[1]-p[0]), 0);
                            return `${d.key}: ${values.toFixed(2)}M`;
                        } else {
                            return `${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M`;
                        }
                    });

                // Add title if it doesn't exist
                paths.merge(newPaths)
                    .selectAll("title")
                    .data(d => [d])
                    .enter()
                    .append("title")
                    .text(d => {
                        if (viewType === 'publisher') {
                            const values = d.reduce((acc, p) => acc + (p[1]-p[0]), 0);
                            return `${d.key}: ${values.toFixed(2)}M`;
                        } else {
                            return `${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M`;
                        }
                    });

                // Fade in new paths
                paths.merge(newPaths)
                    .transition()
                    .duration(this.transitionDuration / 2)
                    .style("opacity", 1);

                // Update title and legend
                this.updateTitleAndLegend(region, viewType, newKeys, newColors, t);
            });

        // Update axes immediately
        this.updateAxes(xStream, yStream, t);
    }

    /**
     * Update title and legend with transition
     * @param {string} region - Current region
     * @param {string} viewType - Current view type
     * @param {Array} keys - Data keys for legend
     * @param {Function} colorScale - Color scale function
     * @param {Object} transition - D3 transition object
     */
    updateTitleAndLegend(region, viewType, keys, colorScale, transition) {
        // Update title
        const titleText = viewType === 'publisher' ? 
            `Publisher Sales in ${region} Over Years` : 
            `Top Genre in ${region} Over Years`;

        this.base.select(".graph-title") // Target the specific title element
            .transition(transition)
            .style("opacity", 0)
            .on("end", function() {
                d3.select(this)
                    .text(titleText)
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
        });

        // Update legend
        const key = this.base.select(".key");
        
        key.selectAll("g")
            .transition(transition)
            .style("opacity", 0)
            .on("end", () => {
                const keySpacing = 30;
                const rectSize = 12;

                const legendGroups = key.selectAll("g")
                    .data(keys, d => d);

                legendGroups.exit().remove();

                const newGroups = legendGroups.enter()
                    .append("g")
                    .style("opacity", 0);

                legendGroups.merge(newGroups)
                    .attr("transform", (d, i) => `translate(0, ${i * keySpacing})`)
                    .each(function(d) {
                        const group = d3.select(this);
                        
                        // Update or add rectangle
                        let rect = group.select("rect");
                        if (rect.empty()) {
                            rect = group.append("rect");
                        }
                        rect.attr("width", rectSize)
                            .attr("height", rectSize)
                            .attr("fill", colorScale(d));

                        // Update or add text
                        let text = group.select("text");
                        if (text.empty()) {
                            text = group.append("text");
                        }
                        text.attr("x", rectSize + 5)
                            .attr("y", rectSize - 2)
                            .text(d)
                            .attr("font-size", "12px");
                    })
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            });
    }

    /**
     * Update axes with transition
     * @param {Function} xScale - X scale function
     * @param {Function} yScale - Y scale function
     * @param {Object} transition - D3 transition object
     */
    updateAxes(xScale, yScale, transition) {
        // Update X axis
        this.base.select(".x-axis")
            .transition(transition)
            .call(d3.axisBottom(xScale).ticks(this.years.length).tickFormat(d3.format("d")));

        // Update Y axis
        this.base.select(".y-axis")
            .transition(transition)
            .call(d3.axisLeft(yScale).ticks(5));
    }

    drawGenre(region) {
        this.base.selectAll("*").remove()
        // Verify we have valid data before proceeding
        if (!this.genreStreamData[region] || this.genreStreamData[region].length === 0) {
            console.error("No valid data to display");
            return;
        }
        const series = d3.stack()
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)
            .keys(this.topGenres[region])
            (this.genreStreamData[region])

        const xStream = d3.scaleLinear()
            .domain(d3.extent(this.years))
            .range([this.streamPos.x + this.streamMargin.left, this.streamPos.x + this.streamSize.width - this.streamMargin.right])
        
        const yStream = d3.scaleLinear()
            .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
            .range([this.streamPos.y + this.streamSize.height - this.streamMargin.bottom, this.streamPos.y + this.streamMargin.top])
        
        const area = d3.area()
            .x(d => xStream(d.data.Year))
            .y0(d => yStream(d[0]))
            .y1(d => yStream(d[1]))
            .curve(d3.curveBasis)
        
        const genreColors = d3.scaleOrdinal()
            .domain(this.topGenres[region])
            .range(d3.schemePaired)

        this.base.selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", d => genreColors(d.key))
            .attr("class", "stream-colors")
            .attr("d", area)
            .append("title")
            .text(d =>{
                const values = d.reduce((acc, p) => acc + (p[1]-p[0]),0)
                return `${d.key}: ${values.toFixed(2)}M`
            })

        //Xaxis in years
        this.base.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.streamPos.y + this.streamSize.height - this.streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(this.years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        this.base.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.streamPos.x + this.streamMargin.left}, 0)`)
            .call(d3.axisLeft(yStream).ticks(5))

        //Yaxis label
        let yaxisx = this.streamPos.x + this.streamMargin.left - 40
        let yaxisy = (this.streamPos.y + this.streamMargin.top + this.streamPos.y + this.streamSize.height - this.streamMargin.bottom) / 2
        this.base.append("text")
            .attr("x", yaxisx)
            .attr("y", yaxisy)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("transform-origin", `${yaxisx} ${yaxisy}`)
            .attr("transform", "rotate(-90)")
            .text("SALES (MILLIONS)")
            
        //Xaxis label
        this.base.append("text")
            .attr("x", (this.streamPos.x + this.streamMargin.left + this.streamPos.x + this.streamSize.width - this.streamMargin.right) / 2)
            .attr("y", this.streamPos.y + this.streamSize.height - this.streamMargin.bottom + 50)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .text("YEAR")
        
        // graph label
        this.base.append("text")
            .attr("class", "graph-title")
            .attr("x", (this.streamPos.x + this.streamMargin.left + this.streamPos.x + this.streamSize.width - this.streamMargin.right) / 2)
            .attr("y", this.streamPos.y + this.streamMargin.top - 30)
            .attr("text-anchor", "middle")
            .attr("font-weight","bold")
            .text(`Top Genre in ${region} Over Years`)

        //creates a key for the graph
        const key = this.base.append("g")
            .attr("class", "key")
            .attr("transform", `translate(${this.streamPos.x + this.streamSize.width}, ${this.streamPos.y + this.streamMargin.top})`)

        const keySpacing = 30
        const rectSize = 12
        
        const totalSalesPerGenre = {}
        series.forEach(d=>{
            const total = d.reduce((acc,p) => acc + (p[1] - p[0]), 0)
            totalSalesPerGenre[d.key] = total
        })
        
        
        key.selectAll("g")
            .data(this.topGenres[region])
            .join("g")
            .attr("transform", (d,i) => `translate(0, ${i * keySpacing})`)
            .each(function(d){
                d3.select(this)
                    .append("rect")
                    .attr("width", rectSize)
                    .attr("height", rectSize)
                    .attr("fill", genreColors(d))

                d3.select(this)
                    .append("text")
                    .attr("x", rectSize +5)
                    .attr("y", rectSize -2)
                    .text(d)
                    .attr("font-size", "12px")

                d3.select(this)
                    .append("text")
                    .attr("x", rectSize +5 + 155)
                    .attr("y", rectSize -2)
                    .text(`${totalSalesPerGenre[d].toFixed(2)}M Total Sale`)
                    .attr("font-size", "12px")
            })

        // Update current state
        this.currentView = 'genre';
        this.currentRegion = region;
    }
    

    drawRegion(region) {
        this.base.selectAll("*").remove()
        // Verify we have valid data before proceeding
        if (this.publisherStreamData[region].length === 0 || this.topPubs[region].length === 0) {
            console.error("No valid data to display");
            return;
        }
        const series = d3.stack()
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)
            .keys(this.topPubs[region])
            (this.publisherStreamData[region])

        const xStream = d3.scaleLinear()
            .domain(d3.extent(this.years))
            .range([this.streamPos.x + this.streamMargin.left, this.streamPos.x + this.streamSize.width - this.streamMargin.right])
        
        const yStream = d3.scaleLinear()
            .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
            .range([this.streamPos.y + this.streamSize.height - this.streamMargin.bottom, this.streamPos.y + this.streamMargin.top])
        
        const area = d3.area()
            .x(d => xStream(d.data.Year))
            .y0(d => yStream(d[0]))
            .y1(d => yStream(d[1]))
            .curve(d3.curveBasis)
        
        const publishersColors = d3.scaleOrdinal()
            .domain(this.topPubs[region])
            .range(d3.schemeCategory10)

        this.base.selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", d => publishersColors(d.key))
            .attr("class", "stream-colors")
            .attr("d", area)
            .append("title")
            .text(d =>{
                const values = d.reduce((acc, p) => acc + (p[1]-p[0]),0)
                return `${d.key}: ${values.toFixed(2)}M`
            })

        //Xaxis in years
        this.base.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.streamPos.y + this.streamSize.height - this.streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(this.years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        this.base.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.streamPos.x + this.streamMargin.left}, 0)`)
            .call(d3.axisLeft(yStream).ticks(5))

        //Yaxis label
        let yaxisx = this.streamPos.x + this.streamMargin.left - 40
        let yaxisy = (this.streamPos.y + this.streamMargin.top + this.streamPos.y + this.streamSize.height - this.streamMargin.bottom) / 2
        this.base.append("text")
            .attr("x", yaxisx)
            .attr("y", yaxisy)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("transform-origin", `${yaxisx} ${yaxisy}`)
            .attr("transform", "rotate(-90)")
            .text("SALES (MILLIONS)")
            
        //Xaxis label
        this.base.append("text")
            .attr("x", (this.streamPos.x + this.streamMargin.left + this.streamPos.x + this.streamSize.width - this.streamMargin.right) / 2)
            .attr("y", this.streamPos.y + this.streamSize.height - this.streamMargin.bottom + 50)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .text("YEAR")
        
        // graph label
        this.base.append("text")
            .attr("class", "graph-title")
            .attr("x", (this.streamPos.x + this.streamMargin.left + this.streamPos.x + this.streamSize.width - this.streamMargin.right) / 2)
            .attr("y", this.streamPos.y + this.streamMargin.top - 30)
            .attr("text-anchor", "middle")
            .attr("font-weight","bold")
            .text(`Publisher Sales in ${region} Over Years`)

        //creates a key for the graph
        const key = this.base.append("g")
            .attr("class", "key")
            .attr("transform", `translate(${this.streamPos.x + this.streamSize.width}, ${this.streamPos.y + this.streamMargin.top})`)

        const keySpacing = 30
        const rectSize = 12
        
        const totalSalesPerPub = {}
        series.forEach(d=>{
            const total = d.reduce((acc,p) => acc + (p[1] - p[0]), 0)
            totalSalesPerPub[d.key] = total
        })
        key.selectAll("g")
            .data(this.topPubs[region])
            .join("g")
            .attr("transform", (d,i) => `translate(0, ${i * keySpacing})`)
            .each(function(d){
                d3.select(this)
                    .append("rect")
                    .attr("width", rectSize)
                    .attr("height", rectSize)
                    .attr("fill", publishersColors(d))

                d3.select(this)
                    .append("text")
                    .attr("x", rectSize +5)
                    .attr("y", rectSize -2)
                    .text(d)
                    .attr("font-size", "12px")
                
                d3.select(this)
                    .append("text")
                    .attr("x", rectSize +5 + 155)
                    .attr("y", rectSize -2)
                    .text(`${totalSalesPerPub[d].toFixed(2)}M Total Sale`)
                    .attr("font-size", "12px")
                
            })

        // Update current state
        this.currentView = 'publisher';
        this.currentRegion = region;
    }
}

export default StreamGraph