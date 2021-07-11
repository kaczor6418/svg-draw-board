import {SvgDrawBoard} from './SvgDrawBoard.js';

export function getMouseXYPositionFromElement(element, mouseEvent) {
    const { left, top } = element.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - left,
        y: mouseEvent.clientY - top
    }
}
