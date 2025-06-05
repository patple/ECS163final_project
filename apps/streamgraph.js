
const publisherArray = ["Nintendo", "Electronic Arts", "Activision", "Sony Computer Entertainment", 
    "Take-Two Interactive", "Microsoft Game Studios", "Ubisoft", "THQ", "Sega", "Atari", "Konami Digital Entertainment",
    "Capcom", "SquareSoft", "Namco Bandai Games", "Enix Corporation", "Square Enix"
];
const publisherColorArray = ['#DC143C', '#9400D3', '#302020', '#1E90FF', '	#708090', '#0C7A1F', '#F5F5F5',
    '#9ACD32', '#00BFFF', '#6B0000', '#FF5733', '#ffe400', '#9E93A0', '#da6921', '#c9edf7', '#22ded4'
];

const genreArray = ["Action", "Sports", "Shooter", "Platform", "Role-Playing", "Racing", "Misc",
    "Fighting", "Simulation", "Puzzle", "Adventure", "Strategy"
];
const genreColorArray = ['#EE8130', '#6390F0', '#F7D02C', '#7AC74C', '#F0FFFF', '#96D9D6', '#C22E28',
    '#A33EA1', '#E2BF65', '#FFD700', '#F95587', '#A6B91A'
]


class StreamGraph {
    parent = null;
    base = null;
    dataset = null;
    windowSize = {width: 0, height: 0};
    streamPos = {x: 0, y: 0};
    streamMargin = {top: 0, right: 0, bottom: 0, left: 0};
    streamSize = {width: 0, height: 0};
    streamBounds = {left: 0, right: 0};

    legendSize = {width: 200, rectSize: 12};
    legendMargins = {left: 0, top: 30, separand: 156, padding: 30};
    legendText = {size: 12};

    
    pubColors = d3.schemeCategory10
    topPubs = {NA: null, JP: null, EU: null, Other: null, Global: null};
    publisherSales = {NA: null, JP: null, EU: null, Other: null, Global: null};
    publisherStreamData = {NA: null, JP: null, EU: null, Other: null, Global: null};
    years = null;

    topGenres = {NA: null, JP: null, EU: null, Other: null, Global: null};
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
     * Sets the parent element from which the streamgraph is made
     * @param {*} parent - d3 selection of an element
     * @returns {Boolean}
     */
    attach(parent) {
        this.parent = parent;
        return true;
    }


    /**
     * Sets the streamgraph window size
     * @param {Object} windowSize - Object with Number fields width, height
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
     * Sets the streamgraph size based on window configurations
     * @returns {Boolean}
     */
    setStream() {
        this.streamBounds.left = this.streamPos.x;
        this.streamSize.width = this.windowSize.width - this.legendSize.width;
        this.streamBounds.right = this.streamBounds.left + this.streamSize.width;
        this.streamSize.height = this.windowSize.height;
        return true;
    }
    
    /**
     * Sets the position at the streamgrah
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
     * Set stream margins for 
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


    /**
     * Clones and initializes dataset for streamgraph calculations
     * @param {Array} dataset - Pointer to the CSV Array
     */
    initDataset(dataset) {
        this.dataset = [...dataset];
        let yrextent = d3.extent(dataset.map(d => d.Year).filter(d => !isNaN(d)));
        yrextent[1]++;
        this.years = d3.range(...yrextent, 1);
    }

    /**
     * Calculates publisher data needed to display a certain region
     * @param {String} region - Region code (NA, JP, EU, Other, Global)
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

    /**
     * Calculates genre data needed for a certain genre
     * @param {*} region - Region code (NA, JP, EU, Other, Global)
     */
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
    transitionTo(region, viewType) {
        // Calculate new data if needed
        if (viewType === 'Publisher') {
            this.calculateRegion(region);
        } else {
            this.calculateGenre(region);
        }

        // Check if this is the first render or same view
        const isFirstRender = !this.currentView && !this.currentRegion;
        const isSameView = this.currentView === viewType && this.currentRegion === region;
        
        if (isSameView) {
            // No transition needed, draw directly
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
     * @param {string} region - Region code (NA, JP, EU, Other, Global)
     * @param {string} viewType - Target view type
     */
    performTransition(region, viewType) {
        const t = d3.transition().duration(this.transitionDuration);
        
        // Get new data and scales
        const stream = this.getStream(region, viewType);

        // Phase 1: Fade out current elements
        this.base.selectAll("path.stream-colors")
            .transition(t)
            .style("opacity", 0)
            .on("end", () => {
                // Phase 2: Update data and fade in new elements
                const paths = this.base.selectAll("path.stream-colors")
                    .data(stream.series, d => d.key);

                // Remove old paths
                paths.exit().remove();

                // Add new paths
                const newPaths = paths.enter()
                    .append("path")
                    .attr("class", "stream-colors")
                    .style("opacity", 0);

                // Update all paths
                paths.merge(newPaths)
                    .attr("fill", d => stream.colors(d.key))
                    .attr("d", stream.area)
                    .select("title")
                    .text(d => {
                        if (viewType === 'Publisher') {
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
                        if (viewType === 'Publisher') {
                            const values = d.reduce((acc, p) => acc + (p[1]-p[0]), 0);
                            return `${d.key}: ${values.toFixed(2)}M`;
                        } else {
                            return `${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M`;
                        }
                    });

                // Fade in new paths
                paths.merge(newPaths)
                    .transition()
                    .style("opacity", 1);
            });

            // Update title and legend
            this.updateTitleAndLegend(region, viewType, stream, t);

        // Update axes immediately
        this.updateAxes(stream.xStream, stream.yStream, t);
    }

    /**
     * Update title and legend with transition
     * @param {string} region - Current region
     * @param {string} viewType - Current view type
     * @param {Object} stream - Stream data object as created by getStream()
     * @param {Object} transition - D3 transition object
     */
    updateTitleAndLegend(region, viewType, stream, transition) {
        // Update title
        let titleText = function(){switch(region){
                case "Other":
                    return `${viewType} Sales in ${region} Regions Over the Years`;
                case "Global":
                    return `${viewType} Sales Globally Over the Years`;
                default:
                    return `${viewType} Sales in the ${region} Region Over the Years`;
            }
        }

        this.base.select(".graph-title") // Target the specific title element
            .transition(transition)
            .style("opacity", 0)
            .on("end", function() {
                d3.select(this)
                    .text(titleText)
                    .transition()
                    .style("opacity", 1);
        });

        // Update legend
        // Redraw Keys
        this.base.selectAll("g.key")
            .transition(transition)
            .style("opacity", 0)
            .on("end", function(){
                this.remove();
            });
        
        this.drawKeys(stream)
            .style("opacity", 0)
            .transition(transition)
            .on("end", function(){
                d3.select(this)
                    .transition()
                    .style("opacity", 1)
            })
        
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
            .call(d3.axisLeft(yScale).ticks(5))
            .selectAll("text").text(d => Math.abs(d))
    }
    
    /**
     * Draws the publisher streamgraph for the desired region
     * @param {String} region - Region code (NA, JP, EU, Other, Global)
     * @returns 
     */
    drawRegion(region, viewType) {
        this.base.selectAll("*").remove()

        const stream = this.getStream(region, viewType)

        this.base.selectAll("path")
            .data(stream.series)
            .join("path")
            .attr("fill", d => stream.colors(d.key))
            .attr("class", "stream-colors")
            .attr("d", stream.area)
            .append("title")
            .text(d =>{
                const values = d.reduce((acc, p) => acc + (p[1]-p[0]),0)
                return `${d.key}: ${values.toFixed(2)}M`
            })

        this.drawAxis(stream.xStream, stream.yStream, viewType, region);

        
        //creates a key for the graph
        this.drawKeys(stream)

        // Update current state
        this.currentView = viewType;
        this.currentRegion = region;
    }

    /**
     * Draws the legend.
     * @param {*} stream 
     * @returns 
     */
    drawKeys(stream) {
        const key = this.base.append("g")
            .attr("class", "key")
            .attr("transform", `translate(${this.streamPos.x + this.streamSize.width}, ${this.streamPos.y + this.streamMargin.top})`)

        const keySpacing = 30
        const rectSize = 12

        key.selectAll("g")
            .data(stream.keys)
            .join("g")
            .attr("transform", (d,i) => `translate(${this.legendMargins.left}, ${i * this.legendMargins.padding})`)
                .append("rect")
                .attr("width", this.legendSize.rectSize)
                .attr("height", this.legendSize.rectSize)
                .attr("fill", d => stream.colors(d))
        key.selectAll("g")
                .append("text")
                .attr("x", this.legendSize.rectSize + 5)
                .attr("y", this.legendSize.rectSize - 2)
                .text(d => d)
                .attr("font-size", `${this.legendText.size}px`)
        key.selectAll("g")
            .append("text")
            .attr("x", this.legendSize.rectSize + this.legendMargins.separand)
            .attr("y", this.legendSize.rectSize - 2)
            .text(d => `${stream.sales[d].toFixed(2)}M Total Sales`)
            .attr("font-size", `${this.legendText.size}px`)
                
        

        return key;
    }


    /**
     * Draws axes and title for the streamgraph
     * @param {*} xStream 
     * @param {*} yStream 
     * @param {*} viewType 
     * @param {*} region 
     */
    drawAxis(xStream, yStream, viewType, region) {
        //Xaxis in years
        this.base.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.streamPos.y + this.streamSize.height - this.streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(this.years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        this.base.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.streamPos.x + this.streamMargin.left}, 0)`)
            .call(d3.axisLeft(yStream).ticks(7))
            .selectAll("text").text(d => Math.abs(d))

        //Yaxis label
        let yaxisx = this.streamPos.x + this.streamMargin.left - 40
        let yaxisy = (this.streamPos.y + this.streamMargin.top + this.streamPos.y + this.streamSize.height - this.streamMargin.bottom) / 2
        this.base.append("text")
            .attr("x", yaxisx)
            .attr("y", yaxisy)
            .attr("font-size", "22px")
            .attr("text-anchor", "middle")
            .attr("transform-origin", `${yaxisx} ${yaxisy}`)
            .attr("transform", "rotate(-90)")
            .text("SALES (MILLIONS)")
            
        //Xaxis label
        this.base.append("text")
            .attr("x", (this.streamPos.x + this.streamMargin.left + this.streamPos.x + this.streamSize.width - this.streamMargin.right) / 2)
            .attr("y", this.streamPos.y + this.streamSize.height - this.streamMargin.bottom + 50)
            .attr("font-size", "22px")
            .attr("text-anchor", "middle")
            .text("YEAR")

        // graph label
        this.base.append("text")
            .attr("class", "graph-title")
            .attr("x", (this.windowSize.width) / 2 + this.streamPos.x)
            .attr("y", this.streamPos.y + this.streamMargin.top - 30)
            .attr("font-size", "30px")
            .attr("text-anchor", "middle")
            .attr("font-weight","bold")
            .text(function(){switch(region){
                case "Other":
                    return `${viewType} Sales in ${region} Regions Over the Years`
                case "Global":
                    return `${viewType} Sales Globally Over the Years`
                default:
                    return `${viewType} Sales in the ${region} Region Over the Years`
            }})
    }


    /**
     * Calculates and returns an object with all needed componenets to
     * display a streamgraph.
     * @param {String} region - Region code (NA, JP, EU, Other, Global)
     * @param {String} viewType 
     * @returns 
     */
    getStream(region, viewType) {
        // Get new data and scales
        const newData = viewType === 'Publisher' ? 
            this.publisherStreamData[region] : 
            this.genreStreamData[region];
        
        const newKeys = viewType === 'Publisher' ? 
            this.topPubs[region] : 
            this.topGenres[region];

        const colorDomain = viewType === 'Publisher' ?
            publisherArray :
            genreArray;

        if (!newData || newData.length === 0 || !newKeys || newKeys.length === 0) {
            console.error("No valid data for transition");
            return null;
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
            .domain(colorDomain)
            .range(viewType === 'Publisher' ? publisherColorArray : genreColorArray);

        const totalSales = {}
        newSeries.forEach(d=>{
            const total = d.reduce((acc,p) => acc + (p[1] - p[0]), 0)
            totalSales[d.key] = total
        })

        return {data: newData, keys: newKeys, series: newSeries, xStream: xStream, yStream: yStream, area: area, colors: newColors, sales: totalSales};
    }
}

export default StreamGraph