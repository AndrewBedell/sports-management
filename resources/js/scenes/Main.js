import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';
import Dashboard from './Dashboard';
import Profile from './Profile';

class Main extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/setting" name="Profile" component={Profile} />
          <Route exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
