import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

import { ifUserSignedIn } from './firebase/firebase';
import { storeUserDetails } from './redux/actions/user';

import Landing from './pages/landing/landing';
import Display from './pages/display/display';
import Session from './pages/session/session';
import SignInAndSignUp from './pages/sign-in-and-sign-up/SignInAndSignUp';
import NotFound from './pages/404/404';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    ifUserSignedIn(user => dispatch(storeUserDetails(user.email, user.displayName)));
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Landing} />
        <Route path='/signin' component={SignInAndSignUp} />
        <Route path='/session' component={Session} />
        <Route path='/display/:code' component={Display} />
        <Route path='/display' component={Display} />
        <Route path='*' component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
