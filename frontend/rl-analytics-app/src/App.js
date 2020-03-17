import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './App.css';

import Landing from './pages/landing/landing';
import Display from './pages/display/display';
import Session from './pages/session/session';
import SignInAndSignUp from './pages/sign-in-and-sign-up/SignInAndSignUp';

import { store, persistor } from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <PersistGate persistor={persistor}>
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route path='/signin' component={SignInAndSignUp} />
            <Route path='/session' component={Session} />
            <Route path='/display/:code' component={Display} />
            <Route path='/display' component={Display} />
          </Switch>
        </PersistGate>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
