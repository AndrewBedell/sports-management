import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';
import Dashboard from './Dashboard';

class Main extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
