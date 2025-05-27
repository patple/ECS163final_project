// hehehaha
import Slide from "./slides/slideTemplate.js"

/**
 * Class that defines a slideshow. Must be created with a constructor.
 */
class Slider {

    /** @type {Slide[]} */
    #slides = null;
    #length = null;
    #index = null;
    #valid = false;
    #transTime = 500;
    #leftSlideX = 0;
    #centerSlideX = 0;
    #rightSlideX = 0;

    /**
     * Constructs a {@link Slider} object with the given parameters.
     * @param {Slide[]} slideArray - Defines an array of {@link Slide} objects to be shown as slides, in order
     * @param {Number} transitionDuration - Defines the time for each slide transition in milliseconds (ms)
     * @param {Number[]} boundaryArray - Defines an Array(3) of x positions as numbers, where: 
     *  - The first index specifies the x position of previous slides. Typically = -width.
     *  - The second index specifies the x position of the current slide. Typically = 0.
     *  - The third index specifices the x position of next slides. Typically = width.
     */
    constructor(slideArray, transitionDuration, boundaryArray) {
        if (this.new(slideArray) == -1 ||
            this.setTransitionDuration(transitionDuration) ||
            this.setSlideBoundaries(boundaryArray) ||
            this.#refreshSlides())
                console.error("Failed making Slider. Exiting Slider constructor.");
            this.currentIndex = 0;
            this.onSlideChange = null; 
    }

    /**
     * Updates the {@link Slider} object's slides with a new array of {@link Slide} objects, in order.
     * @param {Array} slideArray - Defines an array of {@link Slide} objects to be shown as slides, in order
     * @returns {Number} 0 or -1, depending on success
     */
    new(slideArray) {
        if (!(slideArray.reduce((acc, slide) => ((slide instanceof Slide) && acc), true))){
            console.error(`Invalid element type in slider array. Expected all \'g\' elements`);
            this.#slides = null;
            this.on = null;
            this.#index = null;
            this.#valid = false;
            return -1;
        }
        this.#slides = slideArray;
        this.#length = slideArray.length;
        this.#index = 0;
        this.#valid = true;
        return 0;
    }

    /**
     * Updates the {@link Slider} object's transition time.
     * @param {Number} newTime - Defines the time for each slide transition in milliseconds (ms)
     * @returns {Number} 0 or -1, depending on success
     */
    setTransitionDuration(newTime) {
        if (typeof(newTime) != "number") {
            console.error(`Tried to set transition time to non-number: ${newTime}`);
            return -1;
        }
        if (newTime < 0) {
            console.error(`Tried to set negative transition duration: ${this.#transTime} -> ${newTime}`)
            return -1;
        }
        this.#transTime = newTime;
        return 0;
    }

    /**
     * Updates the {@link Slider} object's assigned slide x positions.
     * @param {Array} boundaryArray - Defines an Array(3) of x positions as numbers, where: 
     *  - The first index specifies the x position of previous slides. Typically = -width.
     *  - The second index specifies the x position of the current slide. Typically = 0.
     *  - The third index specifices the x position of next slides. Typically = width.
     * @returns {Number} 0 or -1, depending on success
     */
    setSlideBoundaries(boundaryArray) {
        let err = 0
        typeof(boundaryArray[0]) == "number" ? this.#leftSlideX = boundaryArray[0] :
            (console.error(`Tried to set left slide boundary to non-number: ${boundaryArray[0]}`), err = -1);
        typeof(boundaryArray[1]) == "number" ? this.#centerSlideX = boundaryArray[1] :
            (console.error(`Tried to set center slide boundary to non-number: ${boundaryArray[1]}`), err = -1);
        typeof(boundaryArray[2]) == "number" ? this.#rightSlideX = boundaryArray[2] :
            (console.error(`Tried to set right slide boundary to non-number: ${boundaryArray[2]}`), err = -1);
        return err;
    }

    /**
     * Goes to previous slide. Fails if on first slide.
     * @returns {Number} 0 or -1, depending on success
     */
    goPrev() {
        if (!this.#checkValidity()) return -1;
        if (this.#index - 1 < 0) {
            console.error(`Tried to illegally decrement slides index out of bounds: ${this.#index} -> ${this.#index - 1}`);
            return -1;
        }
        let curr = this.#slides[this.#index].base;
        let prev = this.#slides[this.#index - 1].base;
        curr.transition()
            .duration(this.#transTime)
            .attr("transform",  `translate(${this.#rightSlideX}, 0)`)
            .on("end", function() {
                d3.select(this).attr("visibility", `collapse`)
            })

        prev.attr("visibility", `visible`);
        prev.transition()
            .duration(this.#transTime)
            .attr("transform", `translate(${this.#centerSlideX}, 0)`);

        this.#index--;
        this.currentIndex--;
        if (this.onSlideChange) this.onSlideChange(this.currentIndex);
        return 0;
    }

    /**
     * Goes to next slide. Fails if on last slide.
     * @returns {Number} 0 or -1, depending on success
     */
    goNext() {
        if (!this.#checkValidity()) return -1;
        if (this.#index + 1 >= this.#length) {
            console.error(`Tried to illegally increment slides index out of bounds: ${this.#index} -> ${this.#index + 1}`);
            return -1;
        }
        let curr = this.#slides[this.#index].base;
        let next = this.#slides[this.#index + 1].base;
        curr.transition()
            .duration(this.#transTime)
            .attr("transform",  `translate(${this.#leftSlideX}, 0)`)
            .on("end", function() {
                d3.select(this).attr("visibility", `collapse`)
            })

        next.attr("visibility", `visible`);
        next.transition()
            .duration(this.#transTime)
            .attr("transform", `translate(${this.#centerSlideX}, 0)`);

        this.#index++;
        this.currentIndex++;
        if (this.onSlideChange) this.onSlideChange(this.currentIndex);
        return 0;
        
    }

    /**
     * Refreshes all slide positions and visibility based on index.
     * @returns {Number} 0 or -1, based on success
     */
    #refreshSlides() {
        if (!this.#checkValidity()) return -1;
        this.#slides.forEach((slide, i) => {
            if (i == this.#index) {
                slide.base.attr("visibility", `visible`)
                    .attr("transform", `translate(${this.#centerSlideX}, 0)`);
            } else {
                if (i < this.#index) {
                    slide.base.attr("visibility", `collapse`)
                        .attr("transform", `translate(${this.#leftSlideX}, 0)`);
                } else {
                    slide.base.attr("visibility", `collapse`)
                        .attr("transform", `translate(${this.#rightSlideX}, 0)`)
                }
            }
        })
        return 0;
    }

    /** 
     * Checks whether the slides are valid, which is set on {@link new()}.
     * @returns {Bool} 
     */
    #checkValidity() {
        if (this.#valid) {
            return true;
        } else {
            console.error("Tried to do operation on invalid slides.");
            return false;
        }
    }
}


console.info(`Successfully imported Slider API`)

export default Slider;