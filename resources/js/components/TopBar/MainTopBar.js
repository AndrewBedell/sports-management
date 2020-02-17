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
    document.body.classList.remove('navigation-opened');
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
        <NavbarBrand className="nav-logo" tag={Link} to="/">
          <img src={Bitmaps.logo} alt="Sports logo" />
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleOpen} />
        <Collapse isOpen={isOpen} navbar>
          <Nav>
            <Navbar className="left-nav-bar">
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/" exact>
                  <i className="fa fa-rocket" />
                  Dashboard
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/members">
                  <i className="fa fa-user" />
                  Members
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/reviews">
                  <i className="fa fa-star" />
                  Reviews
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/team">
                  <i className="fa fa-users" />
                  Team
                  <div />
                </NavLink>
              </NavItem>
            </Navbar>
            <RightNavBar />
          </Nav>
        </Collapse>
      </Nav>
    );
  }
}

export default MainTopBar;
