import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import classNames from 'classnames';

import './RemoveButton.scss';

export default function RemoveButton({
  onRemove,
  tooltipText = 'Remove',
  tooltipBottom,
}) {
  const [holding, setHolding] = useState(false);
  const timeoutRef = useRef();

  function done() {
    setHolding(false);
    onRemove();
  }

  function mouseDown() {
    setHolding(true);

    timeoutRef.current = setTimeout(done, 1000);
  }

  function mouseUp() {
    clearTimeout(timeoutRef.current);

    setHolding(false);
  }

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const buttonClass = classNames({
    remove: true,
    holding: holding,
  });

  return (
    <button
      className={buttonClass}
      onMouseLeave={mouseUp}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
    >
      <Tooltip bottom={tooltipBottom} text={tooltipText} />
    </button>
  );
}

RemoveButton.propTypes = {
  onRemove: PropTypes.func.isRequired,
  tooltipText: PropTypes.string,
  tooltipBottom: PropTypes.bool,
};
