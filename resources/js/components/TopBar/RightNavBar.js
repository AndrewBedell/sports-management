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
  Navbar, NavItem, NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import { logout } from '../../actions/common';

import Bitmaps from '../../theme/Bitmaps';

class RightNavBar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);

    const user = JSON.parse(localStorage.getItem('auth'));
    const is_super = user.user.is_super;
    const is_club_member = user.user.is_club_member;

    this.state = {
      is_super: is_super,
      is_club_member: is_club_member
    }
  }

  async handleLogout() {
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {
    const {is_super, is_club_member} = this.state;

    return (
      <Navbar className="right-nav-bar">
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav>
            <img src={Bitmaps.maleAvatar} className="table-avatar mr-2" />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem>
            {
              is_super != 1 && (
                <NavItem>
                  <NavLink tag={Link} to="/profile">
                    <i className="fa fa-user" /> Profile
                  </NavLink>
                </NavItem>
              )
            }
            </DropdownItem>
            <DropdownItem>
            {
              is_super == 1 ? (
                <NavItem>
                  <NavLink tag={Link} to="/admin/reset">
                    <i className="fa fa-key" /> Password Change
                  </NavLink>
                </NavItem>
              ) : (
                <NavItem>
                  <NavLink tag={Link} to="/reset">
                    <i className="fa fa-key" /> Password Change
                  </NavLink>
                </NavItem>
              )
            }
            </DropdownItem>
            <DropdownItem>
            {
              is_club_member == 0 && (
                is_super == 1 ? (
                  <NavItem>
                    <NavLink tag={Link} to="/admin/setting" >
                      <i className="fa fa-sliders-v" /> Financial Setting
                    </NavLink>
                  </NavItem>
                ) : (
                  <NavItem>
                    <NavLink tag={Link} to="/setting" >
                      <i className="fa fa-sliders-v" /> Financial Setting
                    </NavLink>
                  </NavItem>
                )
              )
            }
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <NavItem>
                <NavLink onClick={this.handleLogout}>
                  <i className="fa fa-unlock-alt" /> Log Out
                </NavLink>
              </NavItem>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        
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
