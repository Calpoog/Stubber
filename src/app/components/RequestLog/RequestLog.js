import classNames from 'classnames';
import { clearLog } from '../../store/reducers/logs';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import Actions from '../Actions';

import * as styles from './RequestLog.module.scss';
import { Textbox } from '../Forms';
import { FormProvider, useForm } from 'react-hook-form';

export default function RequestLog() {
  const dispatch = useDispatch();
  const history = useHistory();
  const methods = useForm();
  const search = methods.watch('search', '');
  const logState = useSelector((state) => state.logs);
  const logs = logState.byID.map((id) => logState.byHash[id]);

  function addStub(log) {
    if (log.stubbed) return;

    history.push(`/stub?log=${log.id}`);
  }

  return (
    <FormProvider {...methods}>
      <header>
        <button className="backButton" onClick={history.goBack}></button>
        <h1>Request log</h1>
        <Actions
          actions={{
            'Clear logs': () => dispatch(clearLog()),
          }}
        ></Actions>
      </header>
      <div className="surface py-3">
        <div className="px-3 mb-2">
          <Textbox id="search" name="search" placeholder="Search" icon={<div className={styles.searchIcon}></div>} />
        </div>
        <div className={styles.table}>
          <div className="row mb-2 py-2 px-3 g-0">
            <div className={classNames('col-auto', styles.method)}>Method</div>
            <div className={classNames('col', styles.url)}>URL</div>
            <div className={classNames('col-auto', styles.status)}>Status</div>
          </div>
          {logs.length === 0 && <div className="p-4 text-center">There were no requests while Stubber was open.</div>}
          {logs
            .filter((log) => log.url.includes(search))
            .map((log) => {
              const shortened = shortenURL(log.url);
              const highlighted = search ? shortened.replace(search, `<span class="bold">${search}</span>`) : shortened;
              return (
                <div
                  key={log.id}
                  className={classNames('row px-3 align-items-center g-0', styles.item, {
                    [styles.stubbed]: log.stubbed,
                  })}
                  onClick={() => addStub(log)}
                >
                  <div className={classNames('col-auto', styles.method)}>{log.method}</div>
                  <div className={classNames('col', styles.url)}>
                    <div dangerouslySetInnerHTML={{ __html: highlighted }}></div>
                  </div>
                  <div className={classNames('col-auto', styles.status)}>
                    {log.stubbed ? <div className={styles.stubIcon}></div> : null}
                    <span className={statusClass(log.status)}>{log.status}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </FormProvider>
  );
}

function statusClass(status) {
  return classNames({
    [styles.pending]: status === undefined,
    [styles.success]: status >= 200 && status < 300,
    [styles.redirect]: status >= 300 && status < 400,
    [styles.error]: status >= 400 || isNaN(status),
  });
}

function shortenURL(url) {
  let bits = url.split('/');
  while (bits[bits.length - 1] === '') bits.pop();
  return bits.pop();
}
