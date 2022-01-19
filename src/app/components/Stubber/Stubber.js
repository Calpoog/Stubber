import Folder from '../Folder';
import ImportButton from '../ImportButton';
import exportState from '../../utils/export';
import store from '../../store/store';
import classNames from 'classnames';
import Actions from '../Actions/Actions';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addFolder } from '../../store/reducers/folders';

import * as styles from './Stubber.module.scss';
import { useHistory } from 'react-router';
import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { updateStatus } from '../../store/reducer';
import { sendToBackground } from '../../../shared/connection';

export default function Stubber() {
  const dispatch = useDispatch();
  const history = useHistory();
  const folders = useSelector((state) => state.folders.byID);
  const engaged = useSelector((state) => state.engaged);

  useEffect(async () => {
    const { engaged } = await browser.storage.local.get('engaged');
    dispatch(updateStatus(engaged));
  }, []);

  function exportStubs() {
    const exp = JSON.stringify(exportState(store.getState()), null, 4);
    const a = document.createElement('a');
    const blob = new Blob([exp], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', 'stubs.json');
    a.click();
  }

  async function toggle() {
    dispatch(updateStatus(!engaged));
    await browser.storage.local.set({ engaged: !engaged });
    sendToBackground({ name: 'status', status: !engaged });
  }

  console.log('Stubber render');

  return (
    <>
      <header>
        <div className={styles.logo}></div>
        <h1>Stubber</h1>
        <Actions
          actions={{
            [`Turn ${engaged ? 'off' : 'on'}`]: toggle,
            'New folder': () => dispatch(addFolder({ name: 'New Folder' })),
            'Export stubs': exportStubs,
            'Import stubs': <ImportButton />,
            'Request log': () => history.push('/log'),
          }}
        ></Actions>
      </header>
      <div className={classNames(styles.folderList, { [styles.empty]: folders.length === 0 })}>
        {folders.length === 0 ? (
          <p>You ain&apos;t got no stubs, Lieutenant Dan!</p>
        ) : (
          folders.map((id) => <Folder key={id} id={id} />)
        )}
      </div>
    </>
  );
}
