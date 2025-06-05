/**
 * Button class for buttons
 */
class Button {
    parent = null;
    base = null;
    button = null;

    buttonSize = {width: 0, height: 0};
    buttonColor = "";
    
    border = {width: 0, color: ""};

    text = null;

    constructor(parent, func, args) {
        this.parent = parent
        this.base = this.parent.append("g");
        this.assignFunction(func, args);
    }

    /**
     * Assigns a function that is called when button is clicked.
     * @param {Function} func 
     * @param {*} args 
     */
    assignFunction(func, args) {
        this.base
        this.base.on("click", func(args));
    }

    /**
     * Defines rect characteristics
     * @param {Object} buttonSize - Object with fields width, height
     * @param {String} buttonColor - HTML color string
     * @param {Object} border - Object with fields width, color
     */
    defineRectangle(buttonSize, buttonColor, border) {
        this.buttonSize = buttonSize;
        this.buttonColor = buttonColor;
        this.border = border;
    }


    /**
     * Draws button rect based on assigned characteristics.
     */
    drawRectangle() {
        this.button = this.base.append("rect")
            .attr("width", this.buttonSize.width)
            .attr("height", this. buttonSize.height)
            .attr("x", this.buttonSize.width / 2)
            .attr("y", this.buttonSize.height / 2)
            .attr("fill", this.buttonColor)
            .attr("stroke", this.border.color)
            .attr("stroke-width", this.border.width);
    }

    /**
     * Defines text
     * @param {String} textCol - HTML color string
     * @param {Number} fontSize - Font size
     */
    defineText(textCol, fontSize) {
        if (this.text = null) {
            this.text = this.base.append("text");
        }

        this.text.attr("font-size", fontSize)
            .attr("fill", textCol)
            .attr("text-anchor", center);
    }

    /**
     * Draws the corresponding text.
     * @param {String} text - Text to be displayed
     */
    drawText(text) {
        this.text.text(text);
    }

    /**
     * Moves the base element
     * @param {Number} x 
     * @param {Number} y 
     */
    move(x, y) {
        this.base.attr("transform", `translate(${x}, ${y})`);
    }

    /**
     * Hides all button elements
     */
    hide() {
        this.base.attr("visibility", "hidden");
    }

    /**
     * Shows all button elements
     */
    show() {
        this.base.attr("visibility", "visible");
    }
}


export default Button;