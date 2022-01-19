import { useRef } from 'react';
import { importAction } from '../../store/reducer';
import importStubs from '../../utils/import';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import * as styles from './ImportButton.module.scss';

export default function ImportButton() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const inputElem = useRef(null);

  function onClick() {
    inputElem.current.click();
  }

  function fileImport(e) {
    let files = e.target.files;
    let reader = new FileReader();
    reader.onload = onLoad;
    reader.readAsText(files[0]);
  }

  function onLoad(e) {
    inputElem.current.value = '';
    dispatch(importAction(importStubs(state, e.target.result)));
  }

  return (
    <a className={styles.import} onClick={onClick}>
      <span>Import</span>
      <input tabIndex="-1" ref={inputElem} type="file" onChange={fileImport} />
    </a>
  );
}
