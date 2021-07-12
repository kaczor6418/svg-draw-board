export function getMouseXYPositionFromElement(element, mouseEvent) {
  const {left, top} = element.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - left,
    y: mouseEvent.clientY - top
  }
}

export function createSVGElement(tag, attributes) {
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) {
    svgElement.setAttribute(name, value);
  }
  return svgElement;
}
