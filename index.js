import {SvgDrawBoard} from './SvgDrawer.js';

const drawingArea = document.querySelector('#drawing-area');
const svgDrawer = new SvgDrawBoard(drawingArea);

function getMouseXYPositionFromElement(element, mouseEvent) {
    const { left, top } = element.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - left,
        y: mouseEvent.clientY - top
    }
}

drawingArea.addEventListener('click', (e) => {
    svgDrawer.drawCircle(getMouseXYPositionFromElement(drawingArea, e));
});