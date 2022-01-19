import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import './Spinner.scss';

export default function Spinner({ open }) {
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (open) {
      setTimeout(() => this.setState({ animationComplete: true }), 200);
    } else {
      setAnimationComplete(false);
    }
  }, [open]);

  return !open && animationComplete ? null : (
    <div className={'backdrop' + (open ? '' : ' leaving')}>
      <div className="spinner-wrap">
        <div className="spinner"></div>
      </div>
    </div>
  );
}

Spinner.propTypes = {
  open: PropTypes.bool.isRequired,
};
