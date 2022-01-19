import { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as styles from './Tooltip.module.scss';

// eslint-disable-next-line react/display-name
const Tooltip = memo(({ text, bottom }) => {
  const elem = useRef(null);

  useEffect(() => {
    if (elem.current) {
      const box = elem.current.getBoundingClientRect();
      const ww = window.innerWidth;

      // position starts out centered
      let offsetX = -Math.floor(box.width / 2);
      let width = offsetX * -2;

      // find out if it breaks the boundaries
      const doesFit = box.width < ww;
      const overflowRight = ww - (box.right + offsetX);
      const overflowLeft = box.left + offsetX;

      if (doesFit) {
        console.log('does fit', overflowLeft, overflowRight);
        if (overflowLeft < 0) {
          offsetX += Math.abs(overflowLeft);
        } else if (overflowRight < 0) {
          offsetX += overflowRight;
        }
      } else {
        console.log("doesn't fit", overflowLeft, overflowRight);
        width = ww;
        offsetX = -box.left;
        elem.current.classList.add('wrap');
      }

      elem.current.style.transform = `translate3d(${offsetX}px, 0, 0)`;
      elem.current.style.width = width + 'px';
    }
  });

  return (
    <i className={bottom ? 'bottom' : ''} ref={elem}>
      {text}
    </i>
  );
});

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
  bottom: PropTypes.bool,
};

export default Tooltip;
