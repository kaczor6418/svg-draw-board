export class SvgDrawBoard {
    #drawingArea;

    constructor(drawingArea) {
        this.#drawingArea = drawingArea;
        this.#referenceElement = null;
    }

    drawCircle({x, y}, r = 10) {
        const circle = this.#createSVGElement('circle', {cx: x.toString(), cy: y.toString(), r: r.toString()});
        this.#drawingArea.appendChild(circle);
    }

    #createSVGElement(tag, attributes) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [name, value] of Object.entries(attributes)) {
            svgElement.setAttribute(name, value);
        }
        return svgElement;
    }

}