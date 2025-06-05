const regions = ["NA_Sales","EU_Sales","JP_Sales","Other_Sales","Global_Sales"]
const colors = ["#2020CD", "#228B22", "#DC143C", "#FFD700", "#FFFAF0"]

class BarGraph {
    parent = null;
    base = null;
    barPos = {x: 0, y: 0};
    barMargin = {top: 0, right: 0, bottom: 0, left: 0, padding: 0.15};
    barSize = {width: 0, height: 0};


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
     * @param {Object} barSize 
     * @returns {Boolean}
     */
    resizeBar(barSize) {
        Object.keys(this.barSize).forEach(key => {
            if (isNaN(barSize[key])) return false;
            this.barSize[key] = barSize[key]
        })
        return true;
    }    
    /**
     * 
     * @param {*} barPos 
     * @returns {Boolean}
     */
    moveBar(barPos) {
        Object.keys(this.barPos).forEach(key => {
            if (isNaN(barPos[key])) return false;
            this.barPos[key] = barPos[key]
        })
        return true;
    }

    /**
     * 
     * @param {*} barMargin 
     * @returns {Boolean}
     */
    defineBarMargins(barMargin) {
          Object.keys(this.barMargin).forEach(key => {
            if (isNaN(barMargin[key])) return false;
            this.barMargin[key] = barMargin[key]
        })
        return true;
    }

    drawSearchGame(gameData) {
        this.base.selectAll("*").remove()

        const data = regions.map(region =>({
            region: region.replace("_Sales", ""),
            sales: +gameData[region] || 0
        }))

        const x = d3.scaleBand()
            .domain(data.map(d=> d.region))
            .range([this.barPos.x + this.barMargin.left, this.barPos.x + this.barSize.width - this.barMargin.right])
            .padding(this.barMargin.padding)

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d=> d.sales)])
            .nice()
            .range([this.barPos.y + this.barSize.height - this.barMargin.bottom, this.barPos.y + this.barMargin.top])
        
        const color = d3.scaleOrdinal()
            .domain(regions)
            .range(colors)
        
        //bars
        this.base.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d=> x(d.region))
            .attr("y", d=> y(d.sales))
            .attr("width", x.bandwidth())
            .attr("height", d=> y(0) - y(d.sales))
            .attr("fill", d=> color(d.region))
        
        //Xaxis in regions
        this.base.append("g")
            .attr("transform", `translate(0, ${this.barPos.y + this.barSize.height - this.barMargin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("font-size", "20px")
                .attr("transform", "translate(0, 10)")
        
        //Yaxis in sales in millions
        this.base.append("g")
            .attr("transform", `translate(${this.barPos.x + this.barMargin.left}, 0)`)
            .call(d3.axisLeft(y).ticks(9))
            .selectAll("text")
                .attr("font-size", "14px") 

        //Yaxis label
        let yaxisx = this.barPos.x + this.barMargin.left - 40
        let yaxisy = (this.barPos.y + this.barMargin.top + this.barPos.y + this.barSize.height - this.barMargin.bottom) / 2
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
            .attr("x", (this.barPos.x + this.barMargin.left + this.barPos.x + this.barSize.width - this.barMargin.right) / 2)
            .attr("y", this.barPos.y + this.barSize.height - this.barMargin.bottom + 90)
            .attr("font-size", "22px")
            .attr("text-anchor", "middle")
            .text("YEAR")

        // graph label
        this.base.append("text")
            .attr("class", "graph-title")
            .attr("x", (this.barSize.width) / 2 + this.barPos.x)
            .attr("y", this.barPos.y + this.barMargin.top - 30)
            .attr("font-size", "30px")
            .attr("text-anchor", "middle")
            .attr("font-weight","bold")
            .text(`Stats About Your Choice: ${gameData.Name}`)

        const barGraphInfo = document.getElementById("bar-graph-info")
        barGraphInfo.style.display = "block"
        const infoText = `
            <h2>About Your Game: ${gameData.Name}</h2>
            <p><Strong>Platform</Strong>: ${gameData.Platform}</p>
            <p><Strong>Publisher</Strong>: ${gameData.Publisher}</p>
            <p><Strong>Release Year</Strong>: ${gameData.Year}</p>
            <p><Strong>Global Sales</Strong>: ${gameData.Global_Sales}M</p>
            <p><Strong>North American Sales</Strong>: ${gameData.NA_Sales}M</p>
            <p><Strong>European Sales</Strong>: ${gameData.EU_Sales}M</p>
            <p><Strong>Japanese Sales</Strong>: ${gameData.JP_Sales}M</p>
            <p></Strong>Other Countries Sales</Strong>: ${gameData.Other_Sales}M</p>`
        barGraphInfo.innerHTML = infoText
            
    }
        
       
}

export default BarGraph



