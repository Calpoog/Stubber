import classNames from 'classnames';
import PropTypes from 'prop-types';
import { isValidElement, useEffect, useRef, useState } from 'react';
import * as styles from './Actions.module.scss';

export default function Actions({ actions = () => {} }) {
  const button = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function close() {
      setOpen(false);
    }
    button.current.addEventListener('blur', close);

    return function cleanup() {
      button.current?.removeEventListener('blur', close);
    };
  });

  function takeAction(e, action) {
    e.preventDefault();
    action();
    setOpen(false);
  }

  function toggle(e) {
    e.stopPropagation();
    if (open) button.current.blur();
    setOpen(!open);
  }

  return (
    <button ref={button} className={classNames('actions', styles.button, { [styles.open]: open })} onClick={toggle}>
      <div class={styles.dots}></div>
      <div className={styles.actions}>
        {Object.entries(actions).map(([name, action]) =>
          isValidElement(action) ? (
            <action.type {...action.props} key={name} />
          ) : (
            <a key={name} onClick={(e) => takeAction(e, action)}>
              {name}
            </a>
          )
        )}
      </div>
    </button>
  );
}

Actions.propTypes = {
  actions: PropTypes.object.isRequired,
};
