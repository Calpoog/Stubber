import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import * as styles from './Textbox.module.scss';

export default function Textbox({
  type = 'text',
  name,
  id,
  placeholder,
  icon,
  options = {},
  className = '',
  ...props
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <div
        className={classNames('textbox', styles.textbox, className, {
          [styles.hasError]: errors[name],
          [styles.hasIcon]: icon,
        })}
      >
        {icon && <icon.type {...icon.props} className={classNames(icon.props.className, styles.icon)} />}
        {['text', 'number'].includes(type) ? (
          <input
            id={id}
            name={name}
            placeholder={placeholder}
            {...register(name, options)}
            autoComplete="off"
            type={type}
            {...props}
          />
        ) : (
          <textarea id={id} name={name} placeholder={placeholder} {...register(name, options)} {...props} />
        )}
      </div>
      {errors[name] && <div className={styles.error}>{errors[name].message}</div>}
    </>
  );
}

Textbox.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.object,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
  id: PropTypes.string,
};
