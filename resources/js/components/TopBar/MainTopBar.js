import React, {
  Component
} from 'react';
import {
  NavLink as Link
} from 'react-router-dom';
import {
  Nav, Navbar, NavItem, NavLink, NavbarBrand, NavbarToggler, Collapse
} from 'reactstrap';
import Bitmaps from '../../theme/Bitmaps';
import RightNavBar from './RightNavBar';

class MainTopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.toggleOpen = this.toggleOpen.bind(this);
    this.logout = this.logout.bind(this);
    this.toggleClose = this.toggleClose.bind(this);
  }

  logout() {
    localStorage.clear();
  }

  toggleClose() {
    this.setState({
      isOpen: false
    });
  }

  toggleOpen() {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen
    });
  }

  render() {
    const { isOpen } = this.state;
    return (
      <Nav className="top-header dashboard-top-bar">
        <NavbarBrand className="nav-logo" tag={Link} to="/" onClick={this.toggleClose}>
          <img src={Bitmaps.logo} alt="Sports logo" />
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleOpen} className={isOpen ? 'toggle-opened' : ''} />
        <Collapse isOpen={isOpen} navbar>
          <Nav>
            <Navbar className="left-nav-bar">
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/" exact>
                  <i className="fa fa-home" />
                  Dashboard
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/invite-users" exact>
                  <i className="fa fa-user" />
                  Invite User
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toogleClose}>
                <NavLink tag={Link} to="/payment-player" exact>
                  <i className="fa fa-credit-card" />
                  Payment
                </NavLink>
              </NavItem>
              {/* <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/organizations">
                  <i className="fa fa-users" />
                  Organizations
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/members">
                  <i className="fa fa-user" />
                  Members
                  <div />
                </NavLink>
              </NavItem> */}
            </Navbar>
            <RightNavBar />
          </Nav>
        </Collapse>
      </Nav>
    );
  }
}

export default MainTopBar;
