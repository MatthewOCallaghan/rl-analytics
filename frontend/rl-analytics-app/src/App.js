import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

import { ifUserSignedIn, isSignedIn } from './firebase/firebase';
import { storeUserDetails } from './redux/actions/user';

import Landing from './pages/landing/landing';
import Display from './pages/display/display';
import Session from './pages/session/session';
import SignInAndSignUp from './pages/sign-in-and-sign-up/SignInAndSignUp';
import MatchHistory from './pages/match-history/MatchHistory';
import NotFound from './pages/404/404';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    ifUserSignedIn(user => dispatch(storeUserDetails(user.email, user.displayName)));
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' >
          <Landing />
        </Route>
        <Route path='/signin' >
          <SignInAndSignUp />
        </Route>
        <Route path='/session' >
          <Session />
        </Route>
        <Route path='/display/:code' >
          <Display />
        </Route>
        <Route path='/display' >
          <Display />
        </Route>
        <PrivateRoute path='/matches' >
          <MatchHistory />
        </PrivateRoute>
        <Route path='*' >
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

const PrivateRoute = ({ children, ...rest }) => {
  return (
    <Route
      {...rest} 
      render={({ location }) => isSignedIn() ? children : <Redirect to={{ pathname: "/signin", state: { from: location } }} /> }
    />
  )
}

export default App;
