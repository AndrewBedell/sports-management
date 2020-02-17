import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Store from '../store';

export const AuthRoute = ({ component: Component, ...rest }) => {
  const { auth } = Store.getState().common;
  return (
    <Route
      {...rest}
      render={props => (auth
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />)}
    />
  );
};

export const RedirectIfAuthenticatedRoute = ({ component: Component, ...rest }) => {
  const { auth } = Store.getState().common;
  return (
    <Route
      {...rest}
      render={props => (!auth
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />)}
    />
  );
};

export const SetupRoute = ({ component: Component, ...rest }) => {
  const to = false;
  return (
    <Route
      {...rest}
      render={props => (to
        ? <Redirect to={{ pathname: to, state: { from: props.location } }} />
        : <Component {...props} />
      )}
    />
  );
};

