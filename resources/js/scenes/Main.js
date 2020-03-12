import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';
import Dashboard from './Dashboard';
import Profile from './Users/profile';
import Setting from './Users/setting';
import Reset from './Users/reset';
import Organizations from './Organizations';
import OrganizationDetail from './Organizations/detail';
import Members from './Members/index';
import MemberDetail from './Members/detail';
import OrganizationAdd from './Organizations/add';
import MemberAdd from './Members/add';
import GetInviteUsers from './Users';
import Payment from './Payment';
import Admin from './Admin';
import AdminSetting from './Admin/setting';

class Main extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/payment-player" name="Payment" component={Payment} />
          <Route exact path="/member/register" name="MemberAdd" component={MemberAdd} />
          <Route exact path="/member/detail" name="MemberDetail" component={MemberDetail} />
          <Route exact path="/members" name="Members" component={Members} />
          <Route exact path="/invite-users" name="GetInviteUsers" component={GetInviteUsers} />
          <Route exact path="/organization/create" name="OrganizationAdd" component={OrganizationAdd} />
          <Route exact path="/organization/detail" name="OrganizationDetail" component={OrganizationDetail} />
          <Route exact path="/organizations" name="Organizations" component={Organizations} />
          <Route exact path="/profile" name="Profile" component={Profile} />
          <Route exact path="/setting" name="Setting" component={Setting} />
          <Route exact path="/reset" name="Reset" component={Reset} />
          <Route exact path="/" name="Dashboard" component={Dashboard} />
          <Route exact path="/admin" name="Admin" component={Admin} />
          <Route exact path="/admin/setting" name="AdminSetting" component={AdminSetting} />
          <Route exact path="/admin/reset" name="Reset" component={Reset} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
