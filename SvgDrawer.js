import { getMouseXYPositionFromElement } from './index.js';

const template = `
<svg id="drawing-area" width="100%" height="100%">
    <polyline id="area-polyline" points="" fill="none" stroke="black" />
</svg>
`

export class SvgDrawBoard extends HTMLElement {
    static TAG = 'svg-draw-board';
    static referenceElmentColor = 'green';
    static defaultElmentColor = 'black';

    #drawingArea;
    #polyline;
    #referenceElementProxy;

    constructor(drawingArea) {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = template;
        this.#drawingArea = this.shadowRoot.querySelector('#drawing-area');
        this.#polyline = this.shadowRoot.querySelector('#area-polyline');
        this.#referenceElementProxy = new Proxy({ circle: null }, {
            set: this.#newReferenceElmentHandler
        });
        this.#initializeListeners();
    }

    drawCircle({ x, y }, r = 10) {
        const coordinates = this.#translateToSVGCoordinates(x, y);
        const circle = this.#createSVGElement('circle', {
            cx: coordinates.x.toString(),
            cy: coordinates.y.toString(),
            r: r.toString(),
            fill: SvgDrawBoard.referenceElmentColor
        });
        this.#drawingArea.appendChild(circle);
        this.#referenceElementProxy.circle = circle;
    }

    getCircleCoordinates(circle) {
        return {
            x: Number(circle.getAttribute('cx')),
            y: Number(circle.getAttribute('cy'))
        }
    }

    #translateToSVGCoordinates(x, y) {
        const point = this.#drawingArea.createSVGPoint();
        point.x = x;
        point.y = y;
        point.matrixTransform(this.#drawingArea.getScreenCTM().inverse());
        return { x: point.x, y: point.y };
    }

    #initializeListeners() {
        this.#drawingArea.addEventListener('click', (e) => {
            this.drawCircle(getMouseXYPositionFromElement(this.#drawingArea, e));
        });
    }

    #newReferenceElmentHandler = (oldElement, prop, newElement) => {
        if (prop in oldElement) {
            oldElement[prop]?.setAttribute('fill', SvgDrawBoard.defaultElmentColor);
            oldElement[prop] = newElement;
            this.#addNewPolylinePoint(this.getCircleCoordinates(newElement));
            return true;
        } else {
            throw Error(`Property: ${prop.toString()} doesn't exists in reference elements`)
        }
    }

    #addNewPolylinePoint({ x, y }) {
        const point = this.#drawingArea.createSVGPoint();
        point.x = x;
        point.y = y;
        this.#polyline.points.appendItem(point);
    }

    #createSVGElement(tag, attributes) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [name, value] of Object.entries(attributes)) {
            svgElement.setAttribute(name, value);
        }
        return svgElement;
    }
}

customElements.define(SvgDrawBoard.TAG, SvgDrawBoard);