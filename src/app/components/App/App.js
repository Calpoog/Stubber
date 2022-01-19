import { useEffect, useState } from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';
import RequestLog from '../RequestLog';
import Stubber from '../Stubber';
import StubForm from '../StubForm';

import * as styles from './App.module.scss';
import classNames from 'classnames';

const App = () => {
  const [large, setLarge] = useState(window.innerWidth > 900);

  useEffect(() => {
    const listener = window.addEventListener('resize', () => {
      const isLarge = window.innerWidth > 900;
      if (isLarge !== large) {
        setLarge(isLarge);
      }
    });

    return () => window.removeEventListener('resize', listener);
  });

  return (
    <HashRouter>
      <div className="row h-100 g-0">
        {large && (
          <div className={classNames(styles.leftPane, 'col-auto p-3')}>
            <Stubber />
          </div>
        )}
        <div className="col p-3">
          <Switch>
            <Route path="/stub/:id" key="edit-stub" render={(props) => <StubForm key={props.match.params.id} />} />
            <Route path="/dupe/:id" key="dupe-stub" component={StubForm} />
            <Route path="/stub" key="new-stub" component={StubForm} />
            <Route path="/log" component={RequestLog} />
            <Route path="/">{large ? <div className={styles.empty}></div> : <Stubber />}</Route>
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
