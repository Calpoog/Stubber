import { useRef } from 'react';

export default function useDraggable(placerClass, wrapperElem, findPlacements, onDrop) {
  // Drag stuff, vanilla to avoid the react lifecycle
  const startY = useRef();
  const offsetY = useRef();
  const lastPlacement = useRef();
  const rAF = useRef();
  const placerElem = useRef(null);
  const positions = useRef();

  function mouseDown(e) {
    if (e.button !== 0) return;
    const app = document.getElementById('app');

    // constrain the wrapping element to its current size and left position
    const box = wrapperElem.current.getBoundingClientRect();
    wrapperElem.current.style.width = `${box.width}px`;
    wrapperElem.current.style.height = `${box.height}px`;
    wrapperElem.current.style.left = `${box.left}px`;

    startY.current = e.clientY;
    lastPlacement.current = -1;
    rAF.current = null;

    offsetY.current = box.top;

    positions.current = findPlacements();
    console.log(positions.current);

    wrapperElem.current.classList.add('dragging');
    wrapperElem.current.style.transform = `translate3d(0, ${offsetY.current}px, 0)`;

    // create a placer element to indicate where the item will be dropped
    placerElem.current = document.createElement('div');
    placerElem.current.classList.add(placerClass);
    app.appendChild(placerElem.current);
    // placerElem.current.style.top = offsetY.current + 'px';

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  }

  function mouseMove(e) {
    let diffY = e.clientY - startY.current + offsetY.current;
    const previousPlacement = lastPlacement.current;

    if (diffY > positions.current[0].y) {
      for (let i = 1; i < positions.current.length; i++) {
        let prev = positions.current[i - 1];
        let next = positions.current[i];
        if (diffY < next.y && diffY > prev.y && i !== lastPlacement.current) {
          lastPlacement.current = i;
          break;
        }
      }
    } else {
      lastPlacement.current = 0;
    }

    if (previousPlacement !== lastPlacement.current) {
      placerElem.current.style.top = positions.current[lastPlacement.current].y + 'px';
      console.log(positions.current[lastPlacement.current]);
    }

    cancelAnimationFrame(rAF.current);
    rAF.current = requestAnimationFrame(() => {
      wrapperElem.current.style.transform = `translate3d(0, ${diffY}px, 0)`;
    });
  }

  function mouseUp() {
    cancelAnimationFrame(rAF.current);

    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', mouseUp);

    wrapperElem.current.classList.remove('dragging');
    wrapperElem.current.style = '';

    placerElem.current.remove();

    if (lastPlacement.current < 0) return;

    // check for movement
    const placement = positions.current[lastPlacement.current];
    onDrop(placement);

    console.log('placement ', placement);
  }

  return { onMouseDown: mouseDown, onClick: (e) => e.stopPropagation() };
}
