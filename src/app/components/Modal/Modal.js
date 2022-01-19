import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './Modal.scss';

function Modal({ title, open, onClose, actions, children }) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(true);

  useEffect(() => {
    if (open) {
      // reset animationComplete flag on open
      setIsAnimationComplete(false);
    } else {
      // when closing, set state after animation completes
      setTimeout(() => setIsAnimationComplete(true), 200);
    }
  }, [open]); // only run this effect when open changes

  function close() {
    if (onClose) onClose();
  }
  // only render when it's open OR when it's closed but the animation isn't done
  return !open && isAnimationComplete
    ? null
    : ReactDOM.createPortal(
        <div className={'backdrop' + (open ? '' : ' leaving')} onClick={close}>
          <div
            className='modal'
            onClick={(e) => {
              if (e.target.className !== 'modal') e.stopPropagation();
            }}
          >
            <div className='modal__title'>
              <div className='actions modal__actions'>
                {actions}
                <button onClick={close} className='modal__close'></button>
              </div>
              <span>{title}</span>
            </div>
            <div className='modal__content'>
              <div className='modal__content-wrap'>{children}</div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default Modal;
