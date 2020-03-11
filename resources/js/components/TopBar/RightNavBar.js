import React, { Component } from 'react';
import {
  bindActionCreators
} from 'redux';
import {
  connect
} from 'react-redux';
import {
  withRouter, Link
} from 'react-router-dom';
import {
  Navbar, NavItem, NavLink
} from 'reactstrap';

import { logout } from '../../actions/common';

class RightNavBar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);

    const user = JSON.parse(localStorage.getItem('auth'));
    const is_super = user.user.is_super;

    this.state = {
      is_super: is_super
    }
  }

  async handleLogout() {
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {
    const {is_super} = this.state;

    return (
      <Navbar className="right-nav-bar">
        {
          is_super != 1 && (
            <NavItem>
              <NavLink tag={Link} to="/setting">
                <i className="fa fa-sliders-v" />
              </NavLink>
            </NavItem>
          )
        }
        <NavItem>
          <NavLink onClick={this.handleLogout} className="cursor-pointer">
            <i className="fa fa-unlock-alt" />
          </NavLink>
        </NavItem>
      </Navbar>
    );
  }
}

const mapStateToProps = () => ({
});
const mapDispatchToProps = dispatch => ({
  logout: bindActionCreators(logout, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RightNavBar));
