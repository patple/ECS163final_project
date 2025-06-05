/**
 * Button class for buttons
 */
class Button {
    parent = null;
    base = null;
    button = null;
    clickOverlay = null;

    buttonSize = {width: 0, height: 0};
    buttonColor = "";
    
    border = {width: 0, color: ""};

    text = null;

    constructor(parent) {
        this.parent = parent
        this.base = this.parent.append("g");
    }

    /**
     * Assigns a function that is called when button is clicked.
     * @param {Function} func 
     * @param {*} args 
     */
    assignFunction(func) {
        this.base.on("mousedown", function(){
            func();
            d3.select(this).select("#clickOverlay").attr("fill-opacity", 0.4);
        })
        this.base.on("mouseup", function() {
            d3.select(this).select("#clickOverlay").attr("fill-opacity", 0);
        });
        this.base.on("mouseout", function() {
            d3.select(this).select("#clickOverlay").attr("fill-opacity", 0);
        });
    }

    /**
     * Defines rect characteristics
     * @param {Object} buttonSize - Object with fields width, height
     * @param {String} buttonColor - HTML color string
     * @param {Object} border - Object with fields width, color
     */
    defineRectangle(buttonSize, buttonColor, border, clickColor) {
        this.buttonSize = buttonSize;
        this.buttonColor = buttonColor;
        this.clickColor = clickColor;
        console.log(this.clickColor)
        this.border = border;
        this.button = this.base.append("rect");
    }


    /**
     * Draws button rect based on assigned characteristics.
     */
    drawRectangle() {
        this.button
            .attr("width", this.buttonSize.width)
            .attr("height", this.buttonSize.height)
            .attr("x", -this.buttonSize.width / 2)
            .attr("y", -this.buttonSize.height / 2)
            .attr("fill", this.buttonColor)
            .attr("stroke", this.border.color)
            .attr("stroke-width", `${this.border.width}px`);
        this.clickOverlay = this.base.append("rect")
            .attr("width", this.buttonSize.width)
            .attr("width", this.buttonSize.width)
            .attr("height", this.buttonSize.height)
            .attr("x", -this.buttonSize.width / 2)
            .attr("y", -this.buttonSize.height / 2)
            .attr("fill", "black")
            .attr("fill-opacity", 0)
            .attr("id", "clickOverlay");
    }

    /**
     * Defines text
     * @param {String} textCol - HTML color string
     * @param {Number} fontSize - Font size
     * @param {String} strokeCol
     * @param {Number} strokeWidth
     */
    defineText(textCol, fontSize, strokeCol, strokeWidth) {
        if (this.text === null) {
            this.text = this.base.append("text");
        }

        this.text.attr("font-size", `${fontSize}px`)
            .attr("fill", textCol)
            .attr("text-anchor", "middle")
            .attr("font-weight", 800)
            .attr("stroke", strokeCol)
            .attr("stroke-width", strokeWidth)
            .attr("transform", `translate(0, ${fontSize / 3})`)
            .attr("pointer-events", "none");
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