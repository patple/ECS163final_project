// hehehaha

class Slider {

    slides = null;
    length = null;
    index = null;
    valid = false;

    constructor(svgArray) {
        this.update(svgArray), this.valid = true;
    }

    /*
     *
     *
     * 
     */
    new(svgArray) {
        if (svgArray.reduce((acc, elem) => !((elem.node().nodeName === "svg") && acc), true)) {
            console.error("Invalid element type in slider array. Expected all d3 svg elements.");
            this.slides = null;
            this.index = null;
            this.valid = false;
            return -1;
        }
        this.slides = svgArray;
        this.length = svgArray.length;
        this.index = svgArray[0];
        this.valid = true;
        return 0;
    }

    /*
     *
     *
     * 
     */
    back() {
        this.#checkValidity();
        if (index - 1 < 0) {
            console.error(`Tried to illegally decrement slides index out of bounds.`);
            return -1;
        }
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