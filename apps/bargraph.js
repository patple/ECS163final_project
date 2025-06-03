
class BarGraph {
    parent = null;
    base = null;
    barPos = {x: 0, y: 0};
    barMargin = {top: 0, right: 0, bottom: 0, left: 0};
    barSize = {width: 0, height: 0};
    regions = ["NA_Sales","EU_Sales","JP_Sales","Other_Sales","Global_Sales"]

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

        const data = this.regions.map(region =>({
            region: region.replace("_Sales", ""),
            sales: +gameData[region] || 0
        }))

        const x = d3.scaleBand()
            .domain(data.map(d=> d.region))
            .range([ this.barPos.x + this.barMargin.left, this.barPos.x + this.barSize.width - this.barMargin.right])
            .padding(0.5)

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d=> d.sales)])
            .nice()
            .range([ this.barPos.y + this.barSize.height - this.barMargin.bottom, this.barPos.y + this.barMargin.top])
        
        const color = d3.scaleOrdinal()
            .domain(data.map(d=>d.region))
            .range(d3.schemeSet2)
        
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
        
        //Yaxis in sales in millions
        this.base.append("g")
            .attr("transform", `translate(${this.barPos.x + this.barMargin.left}, 0)`)
            .call(d3.axisLeft(y))

        //Xaxis label
        this.base.append("text")
            .attr("x", (this.barPos.x+this.barSize.width/2))
            .attr("y", this.barPos.y+this.barSize.height + 30)
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .text("YEAR")
            
            
        //Yaxis label
        this.base.append("text")
            .attr("x", -((this.barPos.y+this.barSize.height)/2))
            .attr("y", this.barPos.x+10)
            .attr("transform", "rotate(-90)")
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .text("SALES (MILLIONS)")

        //graph label
        this.base.append("text")
            .attr("x", (this.barPos.x + this.barMargin.left + this.barPos.x + this.barSize.width - this.barMargin.right) / 2)
            .attr("y", this.barPos.y + this.barMargin.top - 30)
            .attr("text-anchor", "middle")
            .attr("font-weight","bold")
            .text(`Stats About ${gameData.Name}`)
            
    }
        
       
}

export default BarGraph



