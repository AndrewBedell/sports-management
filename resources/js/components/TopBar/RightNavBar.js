import React, { Component, Fragment } from 'react';
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
  Badge
} from 'reactstrap';

import Api from '../../apis/app';

import { logout } from '../../actions/common';

import Bitmaps from '../../theme/Bitmaps';

class RightNavBar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);

    const user = JSON.parse(localStorage.getItem('auth'));
    const is_super = user.user.is_super;
    const is_club_member = user.user.is_club_member;
    const role_id = user.user.member_info.role_id;

    this.state = {
      is_super: is_super,
      is_club_member: is_club_member,
      role_id: role_id,
      notification: []
    }
  }

  async componentDidMount() {
    const unread = await Api.get('notification/unread');
    const { response, body } = unread;
    switch (response.status) {
      case 200:
        this.setState({
          notification: body.data
        });
        break;
      default:
        break;
    }
  }

  handleReadNotification(id) {
    this.props.history.push('/notification/read', id);
  }

  async handleLogout() {
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {
    const {
      is_super, is_club_member, role_id,
      notification
    } = this.state;

    return (
      <Navbar className="right-nav-bar">
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav>
            <i className="fa fa-bell fa-lg text-secondary"></i>
            {
              notification.length > 0 && (
                <Badge color="warning">{notification.length}</Badge>
              )
            }
          </DropdownToggle>
          <DropdownMenu className="notification" right>
            {
              notification.length > 0 ? (
                notification.map((item, index) => (
                  <DropdownItem key={index}>
                    <NavItem onClick={this.handleReadNotification.bind(this, item.id)}>
                      <NavLink>
                        <span>{item.content}</span>
                      </NavLink>
                    </NavItem>
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem>
                  <NavItem>
                      No unread notifications.
                  </NavItem>
                </DropdownItem>
              )
            }
            <Fragment>
              <DropdownItem divider />
              <DropdownItem>
                <NavItem>
                  <NavLink className="text-center" style={{padding: 0}} tag={Link} to="/notifications">
                    View All Notification
                  </NavLink>
                </NavItem>
              </DropdownItem>
            </Fragment>
          </DropdownMenu>
        </UncontrolledDropdown>

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
                    <i className="fa fa-key" /> Change Password
                  </NavLink>
                </NavItem>
              ) : (
                <NavItem>
                  <NavLink tag={Link} to="/reset">
                    <i className="fa fa-key" /> Change Password
                  </NavLink>
                </NavItem>
              )
            }
            </DropdownItem>
            {
              is_club_member == 0 && (
                is_super == 1 ? (
                  <DropdownItem>
                    <NavItem>
                      <NavLink tag={Link} to="/admin/setting" >
                        <i className="fa fa-sliders-v" /> Financial Setting
                      </NavLink>
                    </NavItem>
                  </DropdownItem>
                ) : (
                  role_id == 1 && (
                    <DropdownItem>
                      <NavItem>
                        <NavLink tag={Link} to="/setting" >
                          <i className="fa fa-sliders-v" /> Financial Setting
                        </NavLink>
                      </NavItem>
                    </DropdownItem>
                  )
                )
              )
            }
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
