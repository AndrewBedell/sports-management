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
import AdminFederation from './Admin/federations';
import AdminCreate from './Admin/create';
import AdminSetting from './Admin/setting';
import AdminReset from './Admin/reset';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps() {
    const user = JSON.parse(localStorage.getItem('auth'));
    
    if (user.user.is_super == 1) {
      document.body.classList.add('admin');
    } else {
      document.body.classList.remove('admin');
    }
  }

  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/admin/home" name="Admin" component={Admin} />
          <Route exact path="/admin/federations" name="AdminFederation" component={AdminFederation} />
          <Route exact path="/admin/create" name="AdminCreate" component={AdminCreate} />
          <Route exact path="/admin/setting" name="AdminSetting" component={AdminSetting} />
          <Route exact path="/admin/reset" name="AdminReset" component={AdminReset} />

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
        </Switch>
      </Router>
    );
  }
}

export default Main;
