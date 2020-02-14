import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';

import Landing from './pages/landing/landing';
import Display from './pages/display/display';
import Session from './pages/session/session';

function App() {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Landing} />
        <Route path='/session' component={Session} />
        <Route path='/display' component={Display} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
