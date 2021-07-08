export class SvgDrawBoard {
    static referenceElmentColor = 'green';
    static defaultElmentColor = 'black';

    #drawingArea;
    #referenceElementProxy;

    constructor(drawingArea) {
        this.#drawingArea = drawingArea;
        this.#referenceElementProxy = new Proxy({ circle: null }, {
            set: this.#newReferenceElmentHandler
        })
    }

    drawCircle({ x, y }, r = 10) {
        const circle = this.#createSVGElement('circle', { cx: x.toString(), cy: y.toString(), r: r.toString(), fill: SvgDrawBoard.referenceElmentColor });
        this.#drawingArea.appendChild(circle);
        this.#referenceElementProxy.circle = circle;
    }

    #createSVGElement(tag, attributes) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [name, value] of Object.entries(attributes)) {
            svgElement.setAttribute(name, value);
        }
        return svgElement;
    }

    #newReferenceElmentHandler = (oldElement, prop, newElement) => {
        if (prop in oldElement) {
            oldElement[prop]?.setAttribute('fill', SvgDrawBoard.defaultElmentColor);
            oldElement[prop] = newElement;
            return true;
        } else {
            throw Error(`Property: ${prop.toString()} doesn't exists in reference elements`)
        }
    }

}