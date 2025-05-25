// hehehaha

class Slider {

    slides = null;
    length = null;
    index = null;
    valid = false;
    transTime = 500;
    leftSlideX = 0;
    centerSlideX = 0;
    rightSlideX = 0;

    /*
     *
     *
     * 
     */
    constructor(svgArray, transitionDuration, boundaryArray) {
        this.new(svgArray), this.valid = true;
        this.setTransitionDuration(transitionDuration);
        console.log(boundaryArray)
        this.setSlideBoundaries(boundaryArray);
        this.#refreshSlides();
    }

    /*
     *
     *
     * 
     */
    new(gArray) {
        console.log(gArray)
        console.log(gArray[0].node().nodeName)
        if (!(gArray.reduce((acc, elem) => ((elem.node().nodeName === "g") && acc), true))) {
            console.error(`Invalid element type in slider array. Expected all \'g\' elements`);
            this.slides = null;
            this.on = null;
            this.index = null;
            this.valid = false;
            return -1;
        }
        this.slides = gArray;
        this.length = gArray.length;
        this.index = 0;
        this.valid = true;
        return 0;
    }

    /*
     *
     *
     * 
     */
    setTransitionDuration(newTime) {
        if (typeof(newTime) != "number")
            console.error(`Tried to set transition time to non-number: ${newTime}`);
        newTime < 0 ? console.error(`Tried to set negative transition duration: ${this.transTime} -> ${newTime}`) :
            this.transTime = newTime;
    }

    /*
     *
     *
     * 
     */
    setSlideBoundaries(boundaryArray) {
        typeof(boundaryArray[0]) == "number" ? this.leftSlideX = boundaryArray[0] :
            console.error(`Tried to set left slide boundary to non-number: ${boundaryArray[0]}`);
        typeof(boundaryArray[1]) == "number" ? this.centerSlideX = boundaryArray[1] :
            console.error(`Tried to set center slide boundary to non-number: ${boundaryArray[1]}`);
        typeof(boundaryArray[2]) == "number" ? this.rightSlideX = boundaryArray[2] :
            console.error(`Tried to set right slide boundary to non-number: ${boundaryArray[2]}`);
    }

    /*
     *
     *
     * 
     */
    goPrev() {
        if (!this.#checkValidity()) return -1;
        if (this.index - 1 < 0) {
            console.error(`Tried to illegally decrement slides index out of bounds: ${this.index} -> ${this.index - 1}`);
            return -1;
        }
        let curr = this.slides[this.index];
        let prev = this.slides[this.index - 1];
        curr.transition()
            .duration(this.transTime)
            .attr("transform",  `translate(${this.rightSlideX}, 0)`)
            .on("end", function() {
                d3.select(this).attr("visibility", `collapse`)
            })

        prev.attr("visibility", `visible`);
        prev.transition()
            .duration(this.transTime)
            .attr("transform", `translate(${this.centerSlideX}, 0)`);

        this.index--;
        return 0;
    }

    /*
     *
     *
     * 
     */
    goNext() {
        if (!this.#checkValidity()) return -1;
        if (this.index + 1 >= this.length) {
            console.error(`Tried to illegally increment slides index out of bounds: ${this.index} -> ${this.index + 1}`);
            return -1;
        }
        let curr = this.slides[this.index];
        let next = this.slides[this.index + 1];
        curr.transition()
            .duration(this.transTime)
            .attr("transform",  `translate(${this.leftSlideX}, 0)`)
            .on("end", function() {
                d3.select(this).attr("visibility", `collapse`)
            })

        next.attr("visibility", `visible`);
        next.transition()
            .duration(this.transTime)
            .attr("transform", `translate(${this.centerSlideX}, 0)`);

        this.index++;
        return 0;
    }

    /*
     *
     *
     * 
     */
    #refreshSlides() {
        if (!this.#checkValidity()) return -1;
        console.log(this.valid)
        this.slides.forEach((elem, i) => {
            if (i == this.index) {
                elem.attr("visibility", `visible`)
                    .attr("transform", `translate(${this.centerSlideX}, 0)`);
            } else {
                if (i < this.index) {
                    elem.attr("visibility", `collapse`)
                        .attr("transform", `translate(${this.leftSlideX}, 0)`);
                } else {
                    elem.attr("visibility", `collapse`)
                        .attr("transform", `translate(${this.rightSlideX}, 0)`)
                }
            }
        })
    }


    /*
     *
     *
     * 
     */
    #checkValidity() {
        if (this.valid) {
            return true;
        } else {
            console.error("Tried to do operation on invalid slides.");
            return false;
        }
    }
}


console.info(`Successfully imported Slider API`)

export default Slider;