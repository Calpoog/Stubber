import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import * as styles from './Select.module.scss';

export default function Select({ name, options = {}, id, children, className = '', ...props }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={classNames('select', styles.select, className, { [styles.hasError]: errors[name] })}>
      <select id={id} {...register(name, options)} name={name} {...props}>
        {children}
      </select>
    </div>
  );
}

Select.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.object,
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
