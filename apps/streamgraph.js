
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

    drawGenre(region) {
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
            .text(d =>`${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M` )

        //Xaxis in years
        this.base.append("g")
            .attr("transform", `translate(0, ${this.streamPos.y + this.streamSize.height - this.streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(this.years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        this.base.append("g")
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
                    .attr("x", rectSize -2)
                    .text(d)
                    .attr("font-size", "12px")
            })
    }
    

    drawRegion(region) {
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
            .text(d =>`${d.key}: ${(d[d.length - 1][1] - d[d.length -1][0]).toFixed(2)}M` )

        //Xaxis in years
        this.base.append("g")
            .attr("transform", `translate(0, ${this.streamPos.y + this.streamSize.height - this.streamMargin.bottom})`)
            .call(d3.axisBottom(xStream).ticks(this.years.length).tickFormat(d3.format("d")))
        
        //Yaxis in sales in millions
        this.base.append("g")
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
                    .attr("x", rectSize -2)
                    .text(d)
                    .attr("font-size", "12px")
            })
        
    }
}

export default StreamGraph



