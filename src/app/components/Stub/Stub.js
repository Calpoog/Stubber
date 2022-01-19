import { useState, useRef, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { moveStub } from '../../store/reducers/folders';
import classNames from 'classnames';
import useDraggable from '../../hooks/draggable';
import Actions from '../Actions';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { disableStub, removeStub } from '../../store/reducers/stubs';
import store from '../../store/store';
import * as styles from './Stub.module.scss';

const Stub = ({ id }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const stub = useSelector((state) => state.stubs[id]);
  const [removed, setRemoved] = useState(false);
  const [selected, setSelected] = useState(false);

  const wrapperElem = useRef(null);
  const draggable = useDraggable('placer', wrapperElem, findPlacements, (placement) =>
    dispatch(moveStub(stub.folderID, store.getState().folders.byID[placement.folderIndex], id, placement.index))
  );

  function editStub() {
    history.push(`/stub/${id}`);
  }

  function duplicateStub() {
    history.push(`/dupe/${id}`);
  }

  function remove() {
    setRemoved(true);
    setTimeout(() => {
      dispatch(removeStub(stub));
    }, 200);
  }

  function disable() {
    dispatch(disableStub(id, !stub.disabled));
  }

  const { method, name, url, disabled, redirectURL } = stub;
  console.log(`Stub ${id} render`, selected);

  const methodClass = classNames(styles.method, styles[method]);
  const stubClass = classNames('stub', styles.stub, {
    [styles.selected]: selected,
    [styles.disabled]: disabled === true,
    [styles.removed]: removed,
  });

  useEffect(() => {
    // clear alert on location change
    const unlisten = history.listen((location) => {
      const match = location.pathname.match(/\/stub\/([a-z0-9-]+)/);
      console.log('location', name, selected, match && match[1] === id);
      if (selected !== (match && match[1] === id)) setSelected(!selected);
    });

    // stop the listener when component unmounts
    return unlisten;
  });

  return (
    <div className={stubClass} onClick={editStub}>
      <div className={styles.wrapper} ref={wrapperElem}>
        <div className={methodClass} {...draggable}>
          {method}
        </div>
        <div className={styles.content}>
          <div className={styles.name}>{name}</div>
          <div className={styles.url}>
            {url}
            {redirectURL && (
              <>
                <div className={styles.redirect}></div>
                {redirectURL}
              </>
            )}
          </div>
        </div>
        <Actions
          actions={{
            Duplicate: duplicateStub,
            Remove: remove,
            [disabled ? 'Enable' : 'Disable']: disable,
          }}
        ></Actions>
      </div>
      <div className="stub-placement"></div>
    </div>
  );
};

Stub.propTypes = {
  id: PropTypes.string.isRequired,
};

function findPlacements() {
  const placements = [];
  document.querySelectorAll('.folder').forEach((folder, folderIndex) => {
    let spots;
    if (folder.classList.contains('open')) {
      spots = folder.querySelectorAll('.stub-placement');
    } else {
      spots = [folder.querySelector('.stub-placement')];
    }
    spots.forEach((stub, i) => {
      const box = stub.getBoundingClientRect();
      placements.push({ y: box.top, index: i, folderIndex });
    });
  });
  return placements;
}

export default Stub;
