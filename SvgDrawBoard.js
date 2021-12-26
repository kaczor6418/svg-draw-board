import {createSVGElement, getMouseXYPositionFromElement} from './utils.js';

const template = `
<style>
:host {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
<svg id="drawing-area" width="100%" height="100%" preserveAspectRatio="xMinYMin meet">
  <circle id="cursor-preview" r="10" fill="blue" opacity="0.5" />
  <line id="line-preview" stroke="blue" stroke-dasharray="2" opacity="0.5" />
  <polyline id="area-polyline" points="" fill="none" stroke="black" />
</svg>
`

export class SvgDrawBoard extends HTMLElement {
  static TAG = 'svg-draw-board';
  static observedAttributes = ['view-box'];
  static referenceElementColor = 'green';
  static defaultElementColor = 'black';

  #drawingArea;
  #cursorPreview
  #linePreview
  #polyline;
  #referenceElement;
  #stepValues
  #oneRadianAngle

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = template;
    this.#drawingArea = this.shadowRoot.querySelector('#drawing-area');
    this.#cursorPreview = this.shadowRoot.querySelector('#cursor-preview');
    this.#linePreview = this.shadowRoot.querySelector('#line-preview');
    this.#polyline = this.shadowRoot.querySelector('#area-polyline');
    this.#oneRadianAngle = 180 / Math.PI;
    this.#stepValues = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5, 360];
    this.#referenceElement = new Proxy({circle: null}, {
      set: this.#newReferenceElementHandler
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
      this.#drawingArea.style.minWidth = `${width}px`;
      this.#drawingArea.style.minHeight = `${height}px`;
    }
  }

  drawCircle({x, y}, r = 10) {
    const circle = createSVGElement('circle', {
      cx: x.toString(),
      cy: y.toString(),
      r: r.toString(),
      fill: SvgDrawBoard.referenceElementColor
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

  #newReferenceElementHandler = (oldElement, prop, newElement) => {
    if (prop in oldElement) {
      oldElement[prop]?.setAttribute('fill', SvgDrawBoard.defaultElementColor);
      oldElement[prop] = newElement;
      this.#addNewPolylinePoint(this.getCircleCoordinates(newElement));
      this.#resetLivePreview(newElement.getAttribute('cx'), newElement.getAttribute('cy'))
      return true;
    } else {
      throw Error(`Property: ${prop.toString()} doesn't exists in reference elements`)
    }
  }

  #handleLivePreviewChange = (event) => {
    const p2 = getMouseXYPositionFromElement(this.#drawingArea, event);
    let previewPoint = JSON.parse(JSON.stringify(p2));
    if (this.#polyline.points.length > 1) {
      const p1 = this.getCircleCoordinates(this.#referenceElement.circle);
      const slope = this.#radianToAngle(this.#slope(p1, p2));
      const previewAngle = this.#getClosestStep(slope);
      console.log(previewAngle);
      const pointLength =  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      previewPoint.x = p1.x + pointLength * Math.cos(this.#angleToRadian(previewAngle));
      previewPoint.y = p1.y + pointLength * Math.sin(this.#angleToRadian(previewAngle));
    }
    this.#updateLivePreview(this.#translateToSVGCoordinates(previewPoint.x, previewPoint.y));
  }

  #initializeListeners() {
    this.#drawingArea.addEventListener('click', (e) => {
      const {x, y} = getMouseXYPositionFromElement(this.#drawingArea, e);
      this.drawCircle(this.#translateToSVGCoordinates(x, y));
    });
    this.#drawingArea.addEventListener('mousemove', this.#handleLivePreviewChange);
    this.#drawingArea.addEventListener('touchmove', this.#handleLivePreviewChange);
    this.#drawingArea.addEventListener('touchstart', this.#handleLivePreviewChange);
  }

  #getClosestStep(angle) {
    return this.#stepValues.reduce((prev, curr) => {
      return Math.abs(angle - prev) < Math.abs(angle - curr) ? prev : curr;
    }, 0)
  }

  #slope({x: x1, y: y1}, {x: x2, y: y2}) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  #radianToAngle(radian) {
    return radian * this.#oneRadianAngle;
  }

  #angleToRadian(angle) {
    return angle / this.#oneRadianAngle;
  }

  #translateToSVGCoordinates(x, y) {
    const point = this.#drawingArea.createSVGPoint();
    const CTM = this.#drawingArea.getScreenCTM();
    point.x = (x - CTM.e) / CTM.a;
    point.y = (y - CTM.f) / CTM.d;
    point.matrixTransform(this.#drawingArea.getScreenCTM().inverse());
    return {x: point.x, y: point.y};
  }

  #updateLivePreview({x, y}) {
    this.#cursorPreview.setAttribute('cx', x.toString());
    this.#cursorPreview.setAttribute('cy', y.toString());
    if (this.#referenceElement.circle !== null) {
      this.#linePreview.setAttribute('x2', x.toString());
      this.#linePreview.setAttribute('y2', y.toString());
    }
  }

  #resetLivePreview(x, y) {
    this.#linePreview.setAttribute('x1', x);
    this.#linePreview.setAttribute('y1', y);
    this.#linePreview.setAttribute('x2', x);
    this.#linePreview.setAttribute('y2', y);
  }

  #addNewPolylinePoint({x, y}) {
    const point = this.#drawingArea.createSVGPoint();
    point.x = x;
    point.y = y;
    this.#polyline.points.appendItem(point);
  }

}

customElements.define(SvgDrawBoard.TAG, SvgDrawBoard);