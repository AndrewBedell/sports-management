import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Organizations from './Organizations';
import OrganizationDetail from './Organizations/detail';
import Members from './Members/index';
import MemberDetail from './Members/detail';
import OrganizationAdd from './Organizations/add';
import MemberAdd from './Members/add';

class Main extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/member/register" name="MemberAdd" component={MemberAdd} />
          <Route exact path="/member/detail" name="MemberDetail" component={MemberDetail} />
          <Route exact path="/members" name="Members" component={Members} />
          <Route exact path="/organization/create" name="OrganizationAdd" component={OrganizationAdd} />
          <Route exact path="/organization/detail" name="OrganizationDetail" component={OrganizationDetail} />
          <Route exact path="/organizations" name="Organizations" component={Organizations} />
          <Route exact path="/setting" name="Profile" component={Profile} />
          <Route exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
