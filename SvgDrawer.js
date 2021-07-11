import { getMouseXYPositionFromElement } from './index.js';

const template = `
<style>
:host {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
<svg id="drawing-area" width="100%" height="100%" preserveAspectRatio="xMinYMin meet">
    <polyline id="area-polyline" points="" fill="none" stroke="black" />
</svg>
`

export class SvgDrawBoard extends HTMLElement {
    static TAG = 'svg-draw-board';
    static observedAttributes = ['view-box'];
    static referenceElmentColor = 'green';
    static defaultElmentColor = 'black';

    #drawingArea;
    #polyline;
    #referenceElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = template;
        this.#drawingArea = this.shadowRoot.querySelector('#drawing-area');
        this.#polyline = this.shadowRoot.querySelector('#area-polyline');
        this.#referenceElement = new Proxy({ circle: null }, {
            set: this.#newReferenceElmentHandler
        });
        this.#initializeListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return void 0;
        }
        if (name === 'view-box') {
            this.shadowRoot.host.style.overflow = 'auto';
            const [_minX, _minY, width, height] = newValue.split(' ');
            this.#drawingArea.setAttribute('viewBox', newValue);
            this.#drawingArea.style.minWidth = width;
            this.#drawingArea.style.minHeight = height;
        }
    }

    drawCircle({ x, y }, r = 10) {
        const circle = this.#createSVGElement('circle', {
            cx: x.toString(),
            cy: y.toString(),
            r: r.toString(),
            fill: SvgDrawBoard.referenceElmentColor
        });
        this.#drawingArea.appendChild(circle);
        this.#referenceElement.circle = circle;
    }

    getCircleCoordinates(circle) {
        return {
            x: Number(circle.getAttribute('cx')),
            y: Number(circle.getAttribute('cy'))
        }
    }

    #initializeListeners() {
        this.#drawingArea.addEventListener('click', (e) => {
            const { x, y } = getMouseXYPositionFromElement(this.#drawingArea, e);
            this.drawCircle(this.#translateToSVGCoordinates(x, y));
        });
    }

    #translateToSVGCoordinates(x, y) {
        const point = this.#drawingArea.createSVGPoint();
        const CTM = this.#drawingArea.getScreenCTM();
        point.x = (x - CTM.e) / CTM.a;
        point.y = (y - CTM.f) / CTM.d;
        point.matrixTransform(this.#drawingArea.getScreenCTM().inverse());
        return { x: point.x, y: point.y };
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