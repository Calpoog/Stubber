import { useRef, useEffect, useLayoutEffect, memo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { editFolder, moveFolder, removeFolder, toggleFolderOpen } from '../../store/reducers/folders';
import { disableStub } from '../../store/reducers/stubs';
import Stub from '../Stub';
import Actions from '../Actions';
import useDraggable from '../../hooks/draggable';
import { useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import * as styles from './Folder.module.scss';

const Folder = memo(({ id }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const folder = useSelector((state) => state.folders.byHash[id]);
  const firstUpdate = useRef(true);
  const initiallyOpen = useRef(folder.open);
  const isEditing = useSelector((state) => state.folders.editing === id);
  const disabled = useSelector(({ folders, stubs }) => {
    const folder = folders.byHash[id];
    if (folder.stubs.length === 0) return false;

    for (let i = 0; i < folder.stubs.length; i++) {
      if (!stubs[folder.stubs[i]].disabled) return false;
    }
    return true;
  });

  const stubContainerElem = useRef(null);
  const stubWrapElem = useRef(null);
  const inputElem = useRef(null);

  const wrapperElem = useRef(null);
  const draggable = useDraggable('placer', wrapperElem, findPlacements, (placement) =>
    dispatch(moveFolder(folder.id, placement.index))
  );

  useEffect(() => {
    if (isEditing) editName();
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!firstUpdate.current) {
      updateDropdown();
    } else {
      firstUpdate.current = false;
    }
  }, [folder.open]);

  function updateDropdown() {
    stubContainerElem.current.style = `height: ${
      !folder.open ? stubWrapElem.current.clientHeight : 0
    }px; overflow: hidden`;

    requestAnimationFrame(() => {
      stubContainerElem.current.style = `height: ${
        folder.open ? stubWrapElem.current.clientHeight : 0
      }px; overflow: hidden`;

      if (folder.open) setTimeout(() => (stubContainerElem.current.style = 'height: auto'), 200);
    });
  }

  function editName() {
    inputElem.current.disabled = false;
    inputElem.current.focus();
    inputElem.current.setSelectionRange(0, inputElem.current.value.length);
  }

  function saveName(e) {
    inputElem.current.disabled = true;
    dispatch(editFolder(folder.id, e.target.value));
  }

  function nameInput(e) {
    if (e.which === 13) inputElem.current.blur();
  }

  function addStub() {
    history.push(`/stub?folderID=${id}`);
  }

  function remove() {
    dispatch(removeFolder(folder));
  }

  function toggle() {
    dispatch(toggleFolderOpen(id));
  }

  function inputClick(e) {
    if (isEditing) e.stopPropagation();
  }

  function disable() {
    dispatch(disableStub(folder.stubs, !disabled));
  }

  console.log(`Folder ${id} render`);

  const folderClass = classNames('folder', 'surface', 'mb-3', styles.folder, {
    open: folder.open,
    [styles.open]: folder.open,
    [styles.initiallyOpen]: initiallyOpen.current,
    [styles.disabled]: disabled,
  });

  return (
    <div className={folderClass}>
      <div className={styles.header} onClick={toggle}>
        <div className={classNames('px-3', styles.wrapper)} ref={wrapperElem}>
          <div className={styles.handle} {...draggable}></div>
          <div className={styles.content} onClick={inputClick}>
            <input
              ref={inputElem}
              className={styles.name}
              type="text"
              onKeyPress={nameInput}
              onBlur={saveName}
              defaultValue={folder.name}
              disabled
            />
          </div>
          <Actions
            actions={{
              'Edit name': editName,
              'New stub': addStub,
              Remove: remove,
              [disabled ? 'Enable' : 'Disable']: disable,
            }}
          ></Actions>
        </div>
      </div>
      <div ref={stubContainerElem} className={styles.stubs}>
        <div className="stub-placement"></div>
        <div ref={stubWrapElem} className={styles.stubsWrap}>
          {folder.stubs.length === 0 && <div className={styles.emptyMessage}>No stubs.</div>}
          {folder.stubs.map((stubID) => (
            <Stub key={stubID} id={stubID} />
          ))}
        </div>
      </div>
    </div>
  );
});

Folder.propTypes = {
  id: PropTypes.string.isRequired,
};

function findPlacements() {
  const placements = [];
  document.querySelectorAll('.folder').forEach((folder, folderIndex) => {
    const box = folder.getBoundingClientRect();
    // one additional placement for before the first folder
    if (folderIndex === 0) placements.push({ y: box.top - 12, index: 0 });
    // placements are all below each folder
    placements.push({
      y: box.bottom + 8,
      index: folderIndex + 1,
    });
  });
  return placements;
}

export default Folder;
