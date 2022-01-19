import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import * as styles from './Checkbox.module.scss';

export default function Checkbox({ name, id, options = {}, className = '', ...props }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <label className={classNames('checkbox', styles.checkbox, className)}>
      <input {...register(name, options)} type="checkbox" id={id} name={name} {...props} />
      <div className={styles.wrapper}>
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.object,
  id: PropTypes.string,
  className: PropTypes.string,
};
